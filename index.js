const WebSocket = require('ws');

const FALIX_IP = '192.200.119.234'; 
const EAGLER_PORT = '10218'; 

const wss = new WebSocket.Server({ port: process.env.PORT || 3000 });

wss.on('connection', (ws, req) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    const falixSocket = new WebSocket(`ws://${FALIX_IP}:${EAGLER_PORT}`, {
        headers: { 'X-Forwarded-For': clientIp }
    });

    // Disable TCP buffering delays to speed up packet delivery
    ws._socket.setNoDelay(true);

    // Keep-alive heartbeat interval to stop the socket from dropping
    const heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.ping();
        if (falixSocket.readyState === WebSocket.OPEN) falixSocket.ping();
    }, 10000);

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

    const closeAll = () => {
        clearInterval(heartbeat);
        try { ws.close(); } catch(e){}
        try { falixSocket.close(); } catch(e){}
    };

    ws.on('close', closeAll);
    falixSocket.on('close', closeAll);
    ws.on('error', closeAll);
    falixSocket.on('error', closeAll);
});

console.log("Optimized Fast-Tunnel active on Port " + (process.env.PORT || 3000));
