import { WebSocket,WebSocketServer } from "ws";

export const server1Clients = new Set<WebSocket>();
export const server1 = new WebSocketServer({port : 8080})

console.log("✅ Server1 running on ws://localhost:8080");


server1.on('connection', (socket) => {
    server1Clients.add(socket)
    socket.send('connection to server1 : 8080')

    socket.on('message', (msg) => {
        console.log(`📨 Server1 received: ${msg.toString()}`);
        socket.send(`Echo from 8080 : ${msg.toString()}`)
    })

    socket.on('close', () => {
        server1Clients.delete(socket)
    })
})