const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Proxy all requests to 1inch API
app.use(
  "/api",
  createProxyMiddleware({
    target: "https://api.1inch.dev",
    changeOrigin: true,
    pathRewrite: {
      "^/api": "", // remove /api prefix when forwarding
    },
    onProxyReq: function (proxyReq, req, res) {
      // Log the request for debugging
      console.log(`${req.method} ${req.path} -> ${proxyReq.path}`);

      // Ensure proper headers are set
      if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: function (proxyRes, req, res) {
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
      proxyRes.headers["Access-Control-Allow-Methods"] =
        "GET, POST, PUT, DELETE, OPTIONS";
      proxyRes.headers["Access-Control-Allow-Headers"] =
        "Content-Type, Authorization";

      // Log response status
      console.log(
        `Response: ${proxyRes.statusCode} for ${req.method} ${req.path}`
      );
      
      // For error responses, log the response body
      if (proxyRes.statusCode >= 400) {
        let body = '';
        proxyRes.on('data', function(chunk) {
          body += chunk;
        });
        proxyRes.on('end', function() {
          console.log(`Error response body: ${body}`);
        });
      }
    },
    onError: function (err, req, res) {
      console.error("Proxy error:", err);
      res.status(500).json({ error: "Proxy error", details: err.message });
    },
  })
);

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
