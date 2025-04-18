import http.server
import socketserver
import os
import signal
import sys

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Get the requested path
        path = self.path
        
        # Log the request
        print(f"Request: {path}")
        
        # Handle root path
        if path == '/':
            path = '/index.html'
        
        # Handle styles.css request
        if path == '/styles.css':
            path = '/styles/styles.css'
        
        # Map the path to the local filesystem
        fs_path = os.path.join(os.getcwd(), path.lstrip('/'))
        
        # Check if the file exists
        if os.path.exists(fs_path) and os.path.isfile(fs_path):
            # File exists, serve it
            self.path = path
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
        else:
            # File not found
            print(f"404 Not Found: {path}")
            self.send_error(404, f"File not found: {path}")
            return
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def signal_handler(sig, frame):
    print("\n🛑 Server stopping...")
    sys.exit(0)

def main():
    try:
        # Set up signal handler for graceful shutdown
        signal.signal(signal.SIGINT, signal_handler)
        
        # Try to create the server
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print("🚀 Server started at http://localhost:8000")
            print(f"📂 Serving files from: {os.getcwd()}")
            print("❌ Press Ctrl+C to stop the server")
            httpd.serve_forever()
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print("⚠️ Error: Port 8000 is already in use.")
            print("💡 Try stopping the existing server first:")
            print("   pkill -f 'python3 start_server.py'")
        else:
            print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main() 