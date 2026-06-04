import asyncio
import json
import os

import redis.asyncio as redis
from dotenv import load_dotenv
from services.inference import InferenceService

load_dotenv()

# Configuration
REDIS_URL = os.getenv("REDIS_URL")
if not REDIS_URL:
    raise RuntimeError("REDIS_URL environment variable is required")
REQ_QUEUE = "queue:requests"
RES_STREAM = "stream:results"


async def start_worker():
    # 1. Initialize Redis and Inference
    r = redis.from_url(REDIS_URL, decode_responses=True)
    inference = InferenceService()

    # We use '$' to listen for NEW tasks only
    # '0' can be used to listen for previous enqueued tasks
    streams = {REQ_QUEUE: "0"}
    print(f"Worker active. Monitoring {REQ_QUEUE} for LLM tasks...")

    while True:
        try:
            # Syntax fix: streams must be a dict
            # BLOCK=0 means wait forever
            results = await r.xread(streams=streams, block=0, count=1)

            if not results:
                continue

            # Redis Streams return structure: [[stream_name, [[msg_id, data_dict]]]]
            for stream_name, messages in results:
                for msg_id, task in messages:
                    # 1. Extract the DTO from Node.js
                    # Everything comes in as strings from Redis
                    corr_id = task.get("correlationId")
                    user_id = task.get("userId")
                    conv_id = task.get("conversationId")  # The missing link for Node
                    user_msg = task.get("message")
                    room_id = task.get("roomId")
                    is_guest = task.get("isGuest")

                    # Context is a JSON string in our contract
                    context_raw = task.get("context", "[]")
                    context = json.loads(context_raw)

                    print(f"[*] Processing Task: {corr_id} | User: {user_id}")

                    # 2. Stream Generation
                    buffer = ""
                    try:
                        async for chunk in inference.stream_generate(user_msg):
                            # Reflect all IDs back so Node knows where to route the chunk
                            buffer += chunk
                            # Only send to Redis if we have a decent chunk or a newline
                            if len(buffer) > 20 or "\n" in chunk:
                                await r.xadd(
                                    RES_STREAM,
                                    {
                                        "correlationId": corr_id,
                                        "userId": user_id,
                                        "conversationId": conv_id,
                                        "roomId": room_id,
                                        "content": chunk,
                                        "status": "streaming",
                                        "isGuest": is_guest,
                                    },
                                    maxlen=1000,
                                    approximate=True,
                                )

                        # 3. Finalize Stream
                        await r.xadd(
                            RES_STREAM,
                            {
                                "correlationId": corr_id,
                                "userId": user_id,
                                "conversationId": conv_id,
                                "roomId": room_id,
                                "status": "done",
                                "isGuest": is_guest,
                            },
                            maxlen=1000,
                            approximate=True,
                        )

                        # 4. ONLY DELETE if processing finished successfully
                        await r.xdel(REQ_QUEUE, msg_id)
                        print(
                            f"[+] Request {corr_id} processed and removed from queue."
                        )

                    except Exception as ai_err:
                        if "429" in str(ai_err):
                            print("Rate limit hit! Cooling down for 10 seconds...")
                            # Put the task back or just wait
                            await asyncio.sleep(10)
                        else:
                            print(f"AI Generation Error: {ai_err}")
                            await r.xadd(
                                RES_STREAM,
                                {
                                    "correlationId": corr_id,
                                    "userId": user_id,
                                    "conversationId": conv_id,
                                    "status": "error",
                                    "content": "The AI failed to generate a response.",
                                },
                            )

                    # 4. Update cursor to the last processed message ID
                    streams[REQ_QUEUE] = msg_id

        except Exception as e:
            print(f"Worker Loop Error: {e}")
            await asyncio.sleep(2)  # Backoff on connection errors


if __name__ == "__main__":
    try:
        asyncio.run(start_worker())
    except KeyboardInterrupt:
        print("Worker stopped.")
