import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import { config } from "dotenv";

config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
});

io.on('connection', (socket) => {
  
  console.log('New User connected');

  socket.on('disconnect', () => {

    console.log("User Disconnected");
    
  })
  
});


const SERVER_PORT = process.env.SERVER_PORT;

server.listen(process.env.SERVER_PORT, () => {
  console.log(`listening on port ${SERVER_PORT}`);
});

