#!/usr/bin/env python3
"""
Simple HTTP server to run the static site on localhost
Usage: python server.py
"""

import http.server
import socketserver
import os
import sys
from urllib.parse import unquote

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Decode URL
        path = unquote(self.path)
        
        # Handle root path
        if path == '/' or path == '':
            path = '/index.htm'
        
        # Remove trailing slash and redirect (except for root)
        if path.endswith('/') and path != '/':
            self.send_response(301)
            self.send_header('Location', path.rstrip('/'))
            self.end_headers()
            return
        
        # Remove query string (especially Next.js RSC requests like ?_rsc=...)
        if '?' in path:
            path = path.split('?')[0]
        
        # Handle Next.js RSC requests - redirect to the page without query
        if self.path != path and '?' in self.path:
            # If it's an RSC request, serve the page normally
            pass
        
        # Remove leading slash for file system
        file_path = path.lstrip('/')
        
        # Security check
        if '..' in file_path or file_path.startswith('/'):
            self.send_error(403, "Forbidden")
            return
        
        # Check if file exists
        if os.path.isfile(file_path):
            super().do_GET()
            return
        
        # Try with .html extension
        if not file_path.endswith('.html') and not file_path.endswith('.htm'):
            html_path = file_path + '.html'
            if os.path.isfile(html_path):
                self.path = '/' + html_path
                super().do_GET()
                return
            
            # Try with .htm extension
            htm_path = file_path + '.htm'
            if os.path.isfile(htm_path):
                self.path = '/' + htm_path
                super().do_GET()
                return
        
        # Try directory with index.html
        if os.path.isdir(file_path):
            index_path = os.path.join(file_path, 'index.html')
            if os.path.isfile(index_path):
                self.path = '/' + index_path
                super().do_GET()
                return
        
        # Try parent directory with index.html (for routes like /register)
        parent_dir = os.path.dirname(file_path)
        if parent_dir and os.path.isdir(parent_dir):
            index_path = os.path.join(parent_dir, 'index.html')
            if os.path.isfile(index_path):
                self.path = '/' + index_path
                super().do_GET()
                return
        
        # Handle Next.js routes - check for register, login, etc.
        route_mappings = {
            'register': 'register.html',
            'login': 'login.html',
            'pricing': 'pricing.html',
            'privacy': 'privacy.html',
            'terms': 'terms.html',
            'reset': 'reset.html',
        }
        
        route_name = file_path.split('/')[0]
        if route_name in route_mappings:
            mapped_file = route_mappings[route_name]
            if os.path.isfile(mapped_file):
                self.path = '/' + mapped_file
                super().do_GET()
                return
        
        # If still not found, try to serve the file anyway (might be in _next folder)
        if file_path.startswith('_next/'):
            super().do_GET()
            return
        
        # Handle Cloudflare scripts gracefully (return empty response)
        if 'cdn-cgi/challenge-platform' in file_path:
            self.send_response(200)
            self.send_header('Content-Type', 'application/javascript')
            self.end_headers()
            self.wfile.write(b'// Cloudflare challenge script not available in static export')
            return
        
        # Handle Next.js RSC requests (?_rsc=...) - serve the page without the query
        # These are React Server Component requests that don't work in static exports
        # but we can serve the HTML page instead
        if path == '/' or path == '':
            # For root RSC requests, serve index.htm
            if os.path.isfile('index.htm'):
                self.path = '/index.htm'
                super().do_GET()
                return
        
        # 404 Not Found
        self.send_error(404, "File not found")
    
    def end_headers(self):
        # Add CORS headers if needed
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def log_message(self, format, *args):
        # Custom log format
        sys.stderr.write("%s - - [%s] %s\n" %
                        (self.address_string(),
                         self.log_date_time_string(),
                         format%args))

if __name__ == "__main__":
    # Change to the directory where this script is located
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    Handler = MyHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Server running at http://localhost:{PORT}/")
        print(f"Serving directory: {os.getcwd()}")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            sys.exit(0)

