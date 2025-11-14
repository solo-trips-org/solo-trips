import WebSocket from 'ws';
import { URL } from 'url';
import jwt from 'jsonwebtoken';

let wss = null;
const clients = new Map(); // userId -> WebSocket connection

function initWebSocket(server) {
    wss = new WebSocket.Server({ server });

    wss.on('connection', async (ws, req) => {
        try {
            // Get token from URL parameters
            const parameters = url.parse(req.url, true);
            const token = parameters.query.token;

            if (!token) {
                ws.close(1008, 'Authentication required');
                return;
            }

            // Verify JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;

            // Store client connection
            clients.set(userId, ws);

            console.log(`Client connected: ${userId}`);

            ws.on('close', () => {
                clients.delete(userId);
                console.log(`Client disconnected: ${userId}`);
            });

            // Keep connection alive
            ws.on('pong', () => {
                ws.isAlive = true;
            });

            ws.isAlive = true;

        } catch (error) {
            console.error('WebSocket connection error:', error);
            ws.close(1008, 'Authentication failed');
        }
    });

    // Setup ping interval to keep connections alive
    const pingInterval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) {
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => {
        clearInterval(pingInterval);
    });
}

function notifyUser(userId, message) {
    try {
        const client = clients.get(userId);
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error notifying user ${userId}:`, error);
        return false;
    }
}

function broadcast(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

export default {
    initWebSocket,
    notifyUser,
    broadcast,
    getConnectedUsers: () => Array.from(clients.keys())
};