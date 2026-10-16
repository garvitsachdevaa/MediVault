import http from 'node:http';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import app from './app.js';

// Wrap Express in an HTTP server so Socket.io can attach to it in Step 10.
const server = http.createServer(app);

const start = async () => {
  await connectDb();
  server.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT} (${env.NODE_ENV})`);
  });
};

start();

export { server };
