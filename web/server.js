// Start file for hosts that run Node apps through cPanel "Setup Node.js App"
// (Passenger). It just starts the normal production Next.js server on the
// port the host gives us. Not used in local development (use `npm run dev`).
const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Storefront ready on port ${port}`);
  });
});
