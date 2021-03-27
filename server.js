let express= require("express");
let app = express();
let server = require('http').Server(app);
let io = require("socket.io")(server);
let {v4 : uuid} = require('uuid');
let {ExpressPeerServer} = require("peer");
let peer = ExpressPeerServer(server,{
    debug : true
});

app.use("/peerjs",peer);
app.set("view engine","ejs");
app.use(express.static("public"))
app.get("/",(req,res)=>{
res.redirect(`/${uuid()}`);
});

app.get("/:roomId",(req,res)=>{
    res.render("home",{room : req.params.roomId})
});

io.on("connection",(socket)=>{
   socket.on("user-conneted",(userID,roomid)=>{
         socket.join(roomid);
         console.log("Here room is "+roomid)
         socket.to(roomid).emit('newuser-connect', userID);
         socket.on("message_sended",(message)=>{
            socket.to(roomid).emit("message_is",message)
         });
         socket.on('disconnect',()=>{
            io.to(roomid).emit("user-disconnected",userID);
        });
   });
 
});

server.listen(3000,()=>{
    console.log("Server has been started at the port 3000")
})