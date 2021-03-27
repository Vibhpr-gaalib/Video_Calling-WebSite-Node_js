let videoGrid = document.querySelector(".videoGrid");
let myvideo = document.createElement("video");
myvideo.muted = true;
let peers ={}
let socket = io();
let peer = new Peer(undefined,{
    host :"/",
    port:"3000",
    path:"/peerjs"
});
socket.on("connection",()=>{
    console.log("Connected with the server")
});

function createVideStream(video,stream){
    video.srcObject =  stream;
    video.addEventListener("loadedmetadata",()=>{
        video.play();
    });
    videoGrid.append(video);
}

function makeCallTOUser(userId,stream){
    let call = peer.call(userId,stream);
    let video = document.createElement("video");
    call.on("stream", userVideo=>{
        createVideStream(video,userVideo);
    });

    call.on("close",()=>{
        removeELement(video);
    });
    peers[userId] = call;
    
    
}
let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video : true,
    audio : false
}).then(stream=>{
    myVideoStream= stream;
    createVideStream(myvideo,stream);
    peer.on('call',(call)=>{
        call.answer(stream);
        let video = document.createElement("video");
        call.on("stream",function(remoteVideo){
            createVideStream(video,remoteVideo);
        });
    })
    socket.on("newuser-connect",id=>{
       makeCallTOUser(id,stream); //calling the call function here to make the call
    });
});

socket.on("user-disconnected",(userId)=>{
   if(userId in peers){
       peers[userId].close();
   }
})

peer.on("open",(id)=>{
  socket.emit("user-conneted",id,roomId);
});
socket.on("user-connection",(userId)=>{
console.log("Done with the connection "+userId)
})

function removeELement(video){
   video.remove();
}


//handling Event Here
let ul = document.querySelector(".messages");
let chat = document.querySelector(".Chat");
let muteButton = document.querySelector(".Mute");
let pauseVideo = document.querySelector(".Pause");
let rightWindow = document.querySelector(".right_main");
// rightWindow.style.display = "none"
document.addEventListener("keydown",(e)=>{
    let chatAppend = document.querySelector("#chat_message").value;
    if(e.which == 13 && chatAppend.length !=0){
        console.log(chatAppend);
        let li = document.createElement("li");
        li.setAttribute("class","message");
        li.innerHTML = `<b>user</b><br/>${chatAppend}<hr>`
        console.log("li here "+li)
        ul.appendChild(li)
        socket.emit("message_sended", chatAppend);
        document.querySelector("#chat_message").value = "";
    }
});
socket.on("message_is",(message)=>{
    let li = document.createElement("li");
    console.log("Message here is "+message)
    li.setAttribute("class","message");
    li.innerHTML = `<b>user</b><br/>${message}<hr>`
    console.log("li here "+li)
    ul.appendChild(li)
    console.log(li);
});

muteButton.addEventListener("click",()=>{
    console.log( myVideoStream.getAudioTracks()[0])
    myVideoStream.getAudioTracks()[0].enabled = !myVideoStream.getAudioTracks()[0].enabled;
    if(myVideoStream.getAudioTracks()[0].enabled){
        muteButton.firstElementChild.innerHTML ="Mute Button"
    }else{
        muteButton.firstElementChild.innerHTML = "Muted"
    }
});

pauseVideo.addEventListener("click",()=>{
    myVideoStream.getVideoTracks()[0].enabled = !myVideoStream.getVideoTracks()[0].enabled
    if(myVideoStream.getVideoTracks()[0].enabled){
        pauseVideo.firstElementChild.innerHTML ="Pause Button"
    }else{
        pauseVideo.firstElementChild.innerHTML = "Paused"
    }
});
