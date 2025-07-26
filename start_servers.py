#!/usr/bin/env python3
"""
Process manager to run both main.py and agent.py servers
"""
import subprocess
import signal
import sys
import time
import os
from multiprocessing import Process


def run_main_server():
    """Run the main FastAPI server"""
    print("🚀 Starting main FastAPI server on port 9000...")
    try:
        subprocess.run(
            [
                "uvicorn",
                "main:app",
                "--host",
                "0.0.0.0",
                "--port",
                str(os.getenv("PORT", "9000")),
            ]
        )
    except Exception as e:
        print(f"❌ Main server error: {e}")


def run_agent_server():
    """Run the agent Flask server"""
    print("🤖 Starting agent Flask server on port 5000...")
    try:
        subprocess.run(["python", "agent.py"])
    except Exception as e:
        print(f"❌ Agent server error: {e}")


def signal_handler(sig, frame):
    """Handle shutdown signals"""
    print("\n🛑 Shutting down servers...")
    sys.exit(0)


if __name__ == "__main__":
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    print("🚀 Starting Autopilots Application...")

    # Start both servers as separate processes
    main_process = Process(target=run_main_server)
    agent_process = Process(target=run_agent_server)

    try:
        # Start main server
        main_process.start()
        time.sleep(2)  # Give main server time to start

        # Start agent server
        agent_process.start()

        print("✅ Both servers started successfully!")
        print(f"📡 Main API: Port {os.getenv('PORT', '9000')}")
        print("🤖 Agent API: Port 5000")

        # Wait for processes
        main_process.join()
        agent_process.join()

    except KeyboardInterrupt:
        print("\n🛑 Received shutdown signal...")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        # Cleanup processes
        if main_process.is_alive():
            main_process.terminate()
        if agent_process.is_alive():
            agent_process.terminate()

        print("✅ Cleanup complete")
