#!/bin/bash
# Start the API (if you have one)
uvicorn main:app --reload --port 8000 &

# Start the Worker
export PYTHONPATH=$PYTHONPATH:.
# python worker.py
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
