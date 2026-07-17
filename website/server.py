import http.server
import socketserver
import os

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        # Redirect index.html or paths ending in .html to clean URLs
        if self.path.endswith('.html'):
            clean_path = self.path[:-5]
            if not clean_path or clean_path == '/index':
                clean_path = '/'
            self.send_response(301)
            self.send_header('Location', clean_path)
            self.end_headers()
            return
        elif self.path.endswith('/index'):
            self.send_response(301)
            self.send_header('Location', '/')
            self.end_headers()
            return
        super().do_GET()

    def translate_path(self, path):
        translated = super().translate_path(path)
        if not translated.endswith('.html') and not os.path.isdir(translated):
            if os.path.exists(translated + '.html'):
                return translated + '.html'
        return translated

class ThreadingHTTPServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True

if __name__ == '__main__':
    PORT = 8000
    with ThreadingHTTPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
        print(f"Serving at port {PORT} with caching disabled (threaded)")
        httpd.serve_forever()
