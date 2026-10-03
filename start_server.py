"""
Single-command launcher for SAP Quality Report Automation Server & PWA
"""
import socket
import uvicorn
import sys
import os

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

if __name__ == '__main__':
    port = 8000
    host = '0.0.0.0'
    local_ip = get_local_ip()

    print("=" * 65)
    print("  SAP QUALITY REPORT OCR & AUTOMATION SERVER (PWA READY)")
    print("=" * 65)
    print(f"  * Desktop Access:   http://localhost:{port}")
    print(f"  * Mobile Phone:     http://{local_ip}:{port}")
    print("-" * 65)
    print("  MOBILE INSTALL INSTRUCTIONS:")
    print("  1. Connect your phone to the same Wi-Fi network as this PC.")
    print(f"  2. Open Chrome/Safari on your phone and go to: http://{local_ip}:{port}")
    print("  3. Tap 'Install App' or browser menu -> 'Add to Home screen'.")
    print("  4. You now have a full-screen mobile app with camera scanning!")
    print("=" * 65)
    print()

    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
