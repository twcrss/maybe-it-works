# Local Development Server

This is a static Next.js export. To run it on localhost, use one of the following methods:

## Method 1: Python HTTP Server (Recommended)

If you have Python installed:

```bash
python server.py
```

Or with Python 3:
```bash
python3 server.py
```

Then open your browser to: http://localhost:8000

## Method 2: Node.js HTTP Server

If you have Node.js installed:

```bash
node server.js
```

Then open your browser to: http://localhost:8000

## Method 3: Python Built-in Server (Quick)

Navigate to this directory and run:

```bash
python -m http.server 8000
```

Or with Python 3:
```bash
python3 -m http.server 8000
```

## Method 4: PHP Built-in Server

If you have PHP installed:

```bash
php -S localhost:8000
```

## Method 5: Using Live Server (VS Code Extension)

If you're using VS Code:
1. Install the "Live Server" extension
2. Right-click on `index.htm` and select "Open with Live Server"

## Method 6: Using npx (Node.js)

If you have Node.js installed:

```bash
npx http-server -p 8000
```

---

**Note:** The server will run on port 8000 by default. If that port is in use, you can modify the PORT variable in the server scripts.

