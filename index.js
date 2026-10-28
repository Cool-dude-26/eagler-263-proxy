const WebSocket = require('ws');

// Your unique Falix server variables integrated
const FALIX_IP = '192.200.119.234'; 
const EAGLER_PORT = '10218'; 

const wss = new WebSocket.Server({ port: process.env.PORT || 3000 });

wss.on('connection', (ws) => {
    // Open the secure tunnel down to your live Falix Node
    const falixSocket = new WebSocket(`ws://${FALIX_IP}:${EAGLER_PORT}`);

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

console.log("Eaglercraft 26.3 Proxy Tunnel is active on Port " + (process.env.PORT || 3000));
