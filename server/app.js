require('dotenv').config()
const express = require('express');
const app = express();
const Port = process.env.PORT || 4500;
const path = require('path');
const dataSet = require('./dataset')


const server = app.listen(Port , ()=>{
    console.log(`app running on port number ${Port}`)
})

const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname , './public')))

let socketConnected = new Set()

const onConnected = (socket)=>{
    console.log('A user connected' + socket.id);
    socketConnected.add(socket.id)
    // taki client ka count kare
  
    

    //  user login
  socket.on('join', (username) => {
    console.log(`User ${username} logged in`);

    const userDetails = dataSet.find((dt) => {
        return dt.name === username
    })

    console.log(userDetails)
    // socket.join(userId.id)
    socket.join(userDetails.room)

    socketConnected[username] = socket.id;
    io.emit('user-list', Object.keys(socketConnected));
    
    io.emit('nameinput',Object.keys(socketConnected))
  });

   io.emit('clients-total', socketConnected.size)

    socket.on('disconnect', function () {
        console.log('A user disconnected'+socket.id);
        socketConnected.delete(socket.id) 
        io.emit('clients-total', socketConnected.size)

    });
     

    // from main.js
    // sender k alawa sbko message dikhna chahiye
    socket.on('message' , (data)=>{
        console.log(data)
        socket.to(data.room).emit('chat-message', data)
    })

//    from mian.js
// for typing and all
socket.on('feedback' , (data)=>{
    socket.broadcast.emit('feedback', data)
})

}
                   
io.on('connection',onConnected )                                  
