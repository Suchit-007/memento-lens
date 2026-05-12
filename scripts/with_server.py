import argparse
import subprocess
import time
import sys
import os
import urllib.request
import urllib.error
import socket

def kill_process_tree(pid):
    """Robustly terminate a process and all its child processes on Windows/Unix."""
    try:
        if os.name == 'nt':
            subprocess.run(['taskkill', '/F', '/T', '/PID', str(pid)], capture_output=True)
        else:
            # On Unix, if we spawned without session group, just terminate
            os.kill(pid, 15)
    except Exception as e:
        pass

def poll_server(port, health_path, timeout):
    """Poll the server until port is open and responding to health_path."""
    start_time = time.time()
    url = f"http://localhost:{port}{health_path}"
    print(f"Polling server at {url} (timeout={timeout}s)...")
    
    while time.time() - start_time < timeout:
        try:
            # First verify if the port is open
            with socket.create_connection(('localhost', port), timeout=1):
                pass
            
            # If health path is custom or standard, try an HTTP GET request
            req = urllib.request.Request(url, headers={'User-Agent': 'Playwright-Testing-Toolkit'})
            with urllib.request.urlopen(req, timeout=2) as response:
                if response.getcode() < 500:
                    print(f"Server on port {port} is ready!")
                    return True
        except (socket.timeout, ConnectionRefusedError, urllib.error.URLError, socket.error):
            # Not ready yet, wait and try again
            time.sleep(0.5)
            
    print(f"Error: Server on port {port} failed to become ready within {timeout} seconds.", file=sys.stderr)
    return False

def main():
    parser = argparse.ArgumentParser(
        description="Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs."
    )
    parser.add_argument('--server', action='append', help='Command to start the server (can be specified multiple times)')
    parser.add_argument('--port', action='append', type=int, help='Port to wait for (must match number of --server arguments)')
    parser.add_argument('--timeout', type=int, default=30, help='Max seconds to wait for server to respond on port')
    parser.add_argument('--health-path', default='/', help='Endpoint to poll for readiness (default: /)')
    parser.add_argument('command', nargs=argparse.REMAINDER, help='Automation command to execute after --')

    args = parser.parse_args()

    servers = args.server or []
    ports = args.port or []

    if len(servers) != len(ports):
        print("Error: The number of --server arguments must exactly match the number of --port arguments.", file=sys.stderr)
        sys.exit(1)

    # Command cleanup if starting with '--'
    cmd = args.command
    if cmd and cmd[0] == '--':
        cmd = cmd[1:]

    if not cmd and servers:
        print("Error: No automation command specified to run.", file=sys.stderr)
        sys.exit(1)

    processes = []
    try:
        # Start all servers
        for srv_cmd, port in zip(servers, ports):
            print(f"Starting server: {srv_cmd} on port {port}")
            # Use shell=True to support commands like "npm run dev" or chained commands
            p = subprocess.Popen(srv_cmd, shell=True)
            processes.append(p)

        # Poll all servers for readiness
        for port in ports:
            if not poll_server(port, args.health_path, args.timeout):
                sys.exit(1)

        # Execute the automation command
        if cmd:
            print(f"Executing automation command: {' '.join(cmd)}")
            res = subprocess.run(cmd)
            sys.exit(res.returncode)

    except KeyboardInterrupt:
        print("\nExecution interrupted by user. Cleaning up servers...")
        sys.exit(130)
    finally:
        # Terminate all running server processes
        for p in processes:
            print(f"Stopping server process (PID: {p.pid})...")
            kill_process_tree(p.pid)
            try:
                p.terminate()
                p.wait(timeout=2)
            except Exception:
                pass

if __name__ == '__main__':
    main()
