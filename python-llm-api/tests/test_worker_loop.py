"""
Validates: Fix 4 — trailing chunk buffer is flushed before the done event.

A response whose final fragment is < 20 chars and has no trailing newline
must appear as a streaming xadd call before the done event is emitted.
"""

import asyncio
import os
from unittest.mock import AsyncMock, MagicMock

import pytest

from internal.worker_loop import start_worker_loop

RES_STREAM = os.getenv("RES_STREAM", "stream:results")


def _make_redis_mock(task_data: dict) -> tuple[AsyncMock, list[dict]]:
    """Return (redis mock, shared list of xadd field-dicts captured in order)."""
    r = AsyncMock()
    r.xgroup_create = AsyncMock(return_value=True)
    r.xack = AsyncMock()
    r.xdel = AsyncMock()

    xadd_calls: list[dict] = []
    task_complete = asyncio.Event()

    async def _xadd(stream, fields, **kwargs):
        xadd_calls.append(dict(fields))
        if fields.get("status") in ("done", "error"):
            task_complete.set()

    r.xadd = AsyncMock(side_effect=_xadd)

    first_call = True

    async def _xreadgroup(*args, **kwargs):
        nonlocal first_call
        if first_call:
            first_call = False
            return [["queue:requests", [("msg-001", task_data)]]]
        # Block until the current task has been fully processed, then cancel
        await task_complete.wait()
        raise asyncio.CancelledError()

    r.xreadgroup = AsyncMock(side_effect=_xreadgroup)
    return r, xadd_calls


def _inference_with_short_tail():
    """Yields a long chunk (flushed mid-stream) then a short tail < 20 chars."""

    async def _gen(prompt: str):
        yield "This first chunk is definitely longer than twenty chars and triggers a flush"
        yield "tail"  # 4 chars, no newline — stays in buffer without Fix 4

    svc = MagicMock()
    svc.stream_generate = _gen
    return svc


@pytest.mark.asyncio
async def test_trailing_chunk_flushed_before_done_event():
    """Validates: Fix 4 — short final fragment is sent before the done event."""
    task_data = {
        "correlationId": "corr-fix4",
        "userId": "user-fix4",
        "conversationId": "conv-fix4",
        "message": "hello",
        "roomId": "room-fix4",
        "isGuest": "false",
    }

    r, xadd_calls = _make_redis_mock(task_data)
    inference = _inference_with_short_tail()

    worker = asyncio.create_task(start_worker_loop(r, inference))
    try:
        await asyncio.wait_for(worker, timeout=5.0)
    except (asyncio.TimeoutError, asyncio.CancelledError):
        worker.cancel()
        try:
            await worker
        except (asyncio.CancelledError, Exception):
            pass

    streaming = [c for c in xadd_calls if c.get("status") == "streaming"]
    done = [c for c in xadd_calls if c.get("status") == "done"]

    assert len(done) == 1, f"expected exactly one done event, got: {done}"

    tail_calls = [c for c in streaming if c.get("content") == "tail"]
    assert len(tail_calls) == 1, (
        f"'tail' fragment (4 chars, no newline) must be flushed as a streaming "
        f"xadd before the done event. Streaming calls seen: {streaming}"
    )

    all_statuses = [c.get("status") for c in xadd_calls]
    tail_idx = next(i for i, c in enumerate(xadd_calls) if c.get("content") == "tail")
    done_idx = next(i for i, c in enumerate(xadd_calls) if c.get("status") == "done")
    assert tail_idx < done_idx, (
        f"tail flush must precede done event. Call order: {all_statuses}"
    )


@pytest.mark.asyncio
async def test_no_spurious_streaming_call_when_buffer_is_empty():
    """Validates: Fix 4 — no empty streaming xadd is emitted when buffer is already clear."""

    async def _gen_clean(prompt: str):
        # First chunk is long enough to flush immediately; buffer will be empty at end
        yield "This is a long chunk that flushes immediately on yield "

    task_data = {
        "correlationId": "corr-clean",
        "userId": "user-clean",
        "conversationId": "conv-clean",
        "message": "hi",
        "roomId": "room-clean",
        "isGuest": "false",
    }

    r, xadd_calls = _make_redis_mock(task_data)
    inference = MagicMock()
    inference.stream_generate = _gen_clean

    worker = asyncio.create_task(start_worker_loop(r, inference))
    try:
        await asyncio.wait_for(worker, timeout=5.0)
    except (asyncio.TimeoutError, asyncio.CancelledError):
        worker.cancel()
        try:
            await worker
        except (asyncio.CancelledError, Exception):
            pass

    streaming = [c for c in xadd_calls if c.get("status") == "streaming"]
    done = [c for c in xadd_calls if c.get("status") == "done"]

    assert len(done) == 1
    # No streaming call should have empty content
    empty_calls = [c for c in streaming if not c.get("content")]
    assert len(empty_calls) == 0, (
        f"spurious empty streaming xadd emitted when buffer was already clear: {empty_calls}"
    )
