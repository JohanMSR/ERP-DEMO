const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://backend:5000',
      changeOrigin: true,
      secure: false,
      ws: false,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('[PROXY] Proxying:', req.method, req.originalUrl, '->', 'http://backend:5000' + req.originalUrl);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('[PROXY] Response:', req.method, req.originalUrl, '-> Status:', proxyRes.statusCode);
      },
      onError: (err, req, res) => {
        console.log('[PROXY ERROR]', err.message);
        res.status(500).json({ 
          error: 'Proxy error: Cannot connect to backend',
          details: err.message 
        });
      }
    })
  );
};