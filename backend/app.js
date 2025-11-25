import express from 'express';
import { corsMiddleware } from './config/cors.js';
import apiRoutes from './routes.js';
// import cacheMiddleware from '@api-craft/cache'
import { injectAuthContext } from './app/middlewares/injectContext.js'

const app = express();

// Middleware & routes
app.use(corsMiddleware);
app.use(injectAuthContext);

app.use(express.json());
app.use('/api', apiRoutes);
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: "Welcome to Solo Trips API" })
});
export default app;
