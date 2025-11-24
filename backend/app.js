import express from 'express';
import { corsMiddleware } from './config/cors.js';
import apiRoutes from './routes.js';
// import cacheMiddleware from '@api-craft/cache'
import { injectAuthContext } from './app/middlewares/injectContext.js'

const app = express();

// Middleware & routes
app.use(corsMiddleware);
app.use(injectAuthContext);
// app.use(cacheMiddleware({
//   storeType: 'redis', // 'memory' | 'redis' | 'memcached'
//   ttlSeconds: 120,    // Cache time-to-live in seconds
//   prefix: '/api/',    // Only cache routes starting with '/api/'
//   exclude: ['/api/auth'], // Exclude these route substrings from caching
//   redisOptions: {
//     username: process.env.REDIS_USER,
//     password: process.env.REDIS_PASSWORD,
//     socket: {
//       host: process.env.REDIS_HOST,
//       port: process.env.REDIS_PORT
//     },
//   }
// }));

app.use(express.json());
app.use('/api', apiRoutes);
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: "Welcome to Solo Trips API" })
});
export default app;
