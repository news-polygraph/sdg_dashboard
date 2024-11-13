const { createProxyMiddleware } = require("http-proxy-middleware");
const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

console.log("Backend setupProxy:", backendUrl);

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: backendUrl,
      changeOrigin: true,
    })
  );
};
