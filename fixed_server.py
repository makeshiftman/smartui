import http.server
import socketserver
import os
import sys
import urllib.parse

# Use a different port to avoid conflicts
PORT = 9000

class FixedHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Log the request
        print(f"Request: {self.path}")
        
        # Parse the URL to get the path and query parameters
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query = parsed_url.query
        
        # Handle styles.css request
        if path == '/styles.css':
            self.path = '/styles/styles.css'
            print(f"Redirecting to: {self.path}")
        
        # Handle /smartui/scenarios/ paths
        if '/smartui/scenarios/' in path:
            self.path = path.replace('/smartui/scenarios/', '/scenarios/')
            print(f"Redirecting to: {self.path}")
        
        # Handle query parameters with /smartui/scenarios/
        if query and '/smartui/scenarios/' in query:
            query = query.replace('/smartui/scenarios/', '/scenarios/')
            self.path = f"{path}?{query}"
            print(f"Redirecting to: {self.path}")
        
        # Let the parent class handle the request
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

# Create the server
try:
    with socketserver.TCPServer(("", PORT), FixedHandler) as httpd:
        print(f"🚀 Server started at http://localhost:{PORT}")
        print(f"📂 Serving files from: {os.getcwd()}")
        print("❌ Press Ctrl+C to stop the server")
        httpd.serve_forever()
except OSError as e:
    if e.errno == 48:  # Address already in use
        print(f"⚠️ Error: Port {PORT} is already in use.")
        print("💡 Try a different port or restart your computer.")
    else:
        print(f"Error starting server: {e}")
    sys.exit(1)
except KeyboardInterrupt:
    print("\n🛑 Server stopped.")
    sys.exit(0) 