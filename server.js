/**
 * Simple HTTP server to run the static site on localhost
 * Usage: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html',
    '.htm': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

// Route mappings for Next.js-style routes
const ROUTE_MAPPINGS = {
    'register': 'register.html',
    'login': 'login.html',
    'pricing': 'pricing.html',
    'privacy': 'privacy.html',
    'terms': 'terms.html',
    'reset': 'reset.html',
};

const server = http.createServer((req, res) => {
    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // Default to index.htm if root
    if (pathname === '/' || pathname === '') {
        pathname = '/index.htm';
    }

    // Remove query string (especially Next.js RSC requests like ?_rsc=...)
    // But keep the original for logging
    const originalPath = pathname;
    if (pathname.includes('?')) {
        pathname = pathname.split('?')[0];
    }

    // Remove leading slash and resolve path
    let filePath = path.join(BASE_DIR, pathname.replace(/^\//, ''));

    // Security: prevent directory traversal
    if (!filePath.startsWith(BASE_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    // Check if file exists directly
    fs.stat(filePath, (err, stats) => {
        if (!err && stats.isFile()) {
            serveFile(filePath, res);
            return;
        }

        // Try with .html extension
        if (!filePath.endsWith('.html') && !filePath.endsWith('.htm')) {
            const htmlPath = filePath + '.html';
            fs.stat(htmlPath, (err2, stats2) => {
                if (!err2 && stats2.isFile()) {
                    serveFile(htmlPath, res);
                    return;
                }

                // Try with .htm extension
                const htmPath = filePath + '.htm';
                fs.stat(htmPath, (err3, stats3) => {
                    if (!err3 && stats3.isFile()) {
                        serveFile(htmPath, res);
                        return;
                    }

                    // Try directory with index.html
                    fs.stat(filePath, (err4, stats4) => {
                        if (!err4 && stats4.isDirectory()) {
                            const indexPath = path.join(filePath, 'index.html');
                            fs.stat(indexPath, (err5, stats5) => {
                                if (!err5 && stats5.isFile()) {
                                    serveFile(indexPath, res);
                                    return;
                                }
                                tryRouteMapping(pathname, res);
                            });
                            return;
                        }

                        // Try route mapping
                        tryRouteMapping(pathname, res);
                    });
                });
            });
            return;
        }

        // Try route mapping
        tryRouteMapping(pathname, res);
    });
});

function tryRouteMapping(pathname, res) {
    // Extract route name (first part after /)
    const routeName = pathname.split('/').filter(p => p)[0];
    
    if (routeName && ROUTE_MAPPINGS[routeName]) {
        const mappedFile = path.join(BASE_DIR, ROUTE_MAPPINGS[routeName]);
        fs.stat(mappedFile, (err, stats) => {
            if (!err && stats.isFile()) {
                serveFile(mappedFile, res);
                return;
            }
            send404(res);
        });
        return;
    }

    // If path starts with _next, try to serve it anyway (might be a chunk file)
    if (pathname.startsWith('/_next/')) {
        const filePath = path.join(BASE_DIR, pathname.replace(/^\//, ''));
        fs.stat(filePath, (err, stats) => {
            if (!err && stats.isFile()) {
                serveFile(filePath, res);
                return;
            }
            send404(res);
        });
        return;
    }

    // Handle Cloudflare scripts gracefully (return empty response)
    if (pathname.includes('cdn-cgi/challenge-platform')) {
        res.writeHead(200, {
            'Content-Type': 'application/javascript',
            'Access-Control-Allow-Origin': '*'
        });
        res.end('// Cloudflare challenge script not available in static export');
        return;
    }

    // Handle Next.js RSC requests (?_rsc=...) - serve the page without the query
    // These are React Server Component requests that don't work in static exports
    // but we can serve the HTML page instead
    if (pathname === '/' || pathname === '') {
        const indexPath = path.join(BASE_DIR, 'index.htm');
        fs.stat(indexPath, (err, stats) => {
            if (!err && stats.isFile()) {
                serveFile(indexPath, res);
                return;
            }
            send404(res);
        });
        return;
    }

    send404(res);
}

function send404(res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
}

function serveFile(filePath, res) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 Internal Server Error');
            return;
        }

        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
    });
}

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Serving directory: ${BASE_DIR}`);
    console.log('Press Ctrl+C to stop the server');
});

