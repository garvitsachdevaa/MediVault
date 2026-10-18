import http from 'node:http';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import app from './app.js';
import { initSocket } from './sockets/index.js';
import { requeueStuck } from './pipeline/queue.js';
import { startJobs } from './jobs/index.js';

// Wrap Express in an HTTP server so Socket.io can attach to it.
const server = http.createServer(app);
initSocket(server);

const start = async () => {
  await connectDb();
  await requeueStuck();
  startJobs();
  server.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT} (${env.NODE_ENV})`);
  });
};

start();

export { server };
