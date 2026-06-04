import asyncio
import json
import os
import logging

# Configuration - should match your Node.js orchestrator constants
REQ_QUEUE = os.getenv("REQ_QUEUE", "queue:requests")
RES_STREAM = os.getenv("RES_STREAM", "stream:results")
CONSUMER_GROUP = "inference_workers"
CONSUMER_NAME = f"worker_{os.getpid()}"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("WorkerLoop")

async def start_worker_loop(r, inference):
    """
    Injected Worker Loop.
    :param r: redis.asyncio client instance from lifespan
    :param inference: InferenceService instance from lifespan
    """
    
    # 1. Setup Consumer Group (Fail-safe)
    try:
        await r.xgroup_create(REQ_QUEUE, CONSUMER_GROUP, id="0", mkstream=True)
    except Exception:
        # Group already exists, which is normal on restart
        pass

    logger.info(f"Worker active. Consumer Group: {CONSUMER_GROUP} | Name: {CONSUMER_NAME}")

    while True:
        try:
            # 2. Read from Group
            # 'count=1' ensures we don't hog tasks if we scale to multiple workers
            # '>' means only new messages that haven't been delivered to others
            results = await r.xreadgroup(CONSUMER_GROUP, CONSUMER_NAME, {REQ_QUEUE: ">"}, block=0, count=1)

            if not results:
                continue

            for _, messages in results:
                for msg_id, task in messages:
                    # Extract DTO
                    corr_id = task.get("correlationId")
                    user_id = task.get("userId")
                    conv_id = task.get("conversationId")
                    user_msg = task.get("message")
                    room_id = task.get("roomId")
                    is_guest = task.get("isGuest")

                    logger.info(f"[*] Task Received: {corr_id} for User: {user_id}")

                    buffer = ""
                    try:
                        # 3. Stream Generation
                        async for chunk in inference.stream_generate(user_msg):
                            buffer += chunk
                            # Thresholding to prevent Redis spam
                            if len(buffer) > 20 or "\n" in chunk:
                                await r.xadd(
                                    RES_STREAM,
                                    {
                                        "correlationId": corr_id,
                                        "userId": user_id,
                                        "conversationId": conv_id,
                                        "roomId": room_id,
                                        "content": buffer,
                                        "status": "streaming",
                                        "isGuest": is_guest,
                                    },
                                    maxlen=1000,
                                    approximate=True
                                )
                                buffer = "" # Clear buffer after push

                        # 4. Finalize
                        if buffer:
                            await r.xadd(
                                RES_STREAM,
                                {
                                    "correlationId": corr_id,
                                    "userId": user_id,
                                    "conversationId": conv_id,
                                    "roomId": room_id,
                                    "content": buffer,
                                    "status": "streaming",
                                    "isGuest": is_guest,
                                },
                                maxlen=1000,
                                approximate=True
                            )
                            buffer = ""
                        await r.xadd(
                            RES_STREAM,
                            {
                                "correlationId": corr_id,
                                "userId": user_id,
                                "conversationId": conv_id,
                                "roomId": room_id,
                                "status": "done",
                                "isGuest": is_guest,
                            }
                        )

                        # 5. Acknowledge and Delete
                        # In Consumer Groups, we 'ack' to remove from pending
                        await r.xack(REQ_QUEUE, CONSUMER_GROUP, msg_id)
                        await r.xdel(REQ_QUEUE, msg_id)
                        logger.info(f"[+] Task {corr_id} Completed.")

                    except Exception as ai_err:
                        error_msg = str(ai_err)
                        if "429" in error_msg:
                            logger.warning("Rate limit hit! Cooling down...")
                            await asyncio.sleep(10)
                        else:
                            logger.error(f"Inference Error: {error_msg}")
                            await r.xadd(RES_STREAM, {
                                "correlationId": corr_id,
                                "status": "error",
                                "content": "AI service temporarily unavailable."
                            })
                            # Still ack/del to prevent infinite loops on bad requests
                            await r.xack(REQ_QUEUE, CONSUMER_GROUP, msg_id)
                            await r.xdel(REQ_QUEUE, msg_id)

        except Exception as e:
            logger.error(f"Worker Loop Fatal Error: {e}")
            await asyncio.sleep(5) # Backoff before retry
