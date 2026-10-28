const WebSocket = require('ws');

const FALIX_IP = '192.200.119.234'; 
const EAGLER_PORT = '10218'; 

const wss = new WebSocket.Server({ port: process.env.PORT || 3000 });

wss.on('connection', (ws, req) => {
    // Grab the IP from Codespaces or use a fallback placeholder
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    // Inject the X-Forwarded-For header into the outbound Falix connection headers list
    const falixSocket = new WebSocket(`ws://${FALIX_IP}:${EAGLER_PORT}`, {
        headers: {
            'X-Forwarded-For': clientIp
        }
    });

    ws.on('message', (message) => {
        if (falixSocket.readyState === WebSocket.OPEN) {
            falixSocket.send(message);
        }
    });

    falixSocket.on('message', (message) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    });

    ws.on('close', () => falixSocket.close());
    falixSocket.on('close', () => ws.close());
    ws.on('error', () => falixSocket.close());
    falixSocket.on('error', () => ws.close());
});

console.log("Eaglercraft Proxy with Header-Injection active on Port " + (process.env.PORT || 3000));
