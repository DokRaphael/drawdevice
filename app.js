// Including libraries

var express = require('express'),
	http = require('http'),
	app = express(),
	server = http.createServer(app),
	path = require('path'),
	url = require('url'),
	fs = require('fs'),
	crypto = require('crypto'),
    io = require('socket.io').listen(server);

	
var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"};
    
var servernb = 0;
var outputFilename = 'my.json';
var myData = {};
var roomname='';
var urlparsed='';
var socketCodes = {};
var usernames = {};
/*var roomsusers = {
    room: [],
    name: []
};*/
var roomsusers = [];
var rooms = {};



var randurl = '';
var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";
var requestedurl = '';
        
server.listen(process.env.C9_PORT || 8333); 


app.get('/Draw', function (req, res)
{
	res.sendfile(__dirname + '/assets/index.html' );    
	
});
app.use(express.static(path.join(__dirname, '/assets')));

app.get('/img', function (req, res)
{
	res.sendfile(__dirname + '/assets/img' );    
	
});
app.get('/', function (req, res)
{
	res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page introuvable !');
});


// Delete this row if you want to see debug messages
io.set('log level', 1);

// Listen for incoming connections from clients
io.sockets.on('connection', function (socket) 
{
	socket.emit("welcome", {});

	socket.on('username', function(username)
	{ 
		// store the username in the socket session for this client
		socket.username = username;
		// add the client's username to the global list
		usernames[username] = username;
	});
	
	socket.on('create', function(username)
	{
		var roomCode = crypto.randomBytes(3).toString('hex');
		while(roomCode in socketCodes)
    	{
       		roomCode = crypto.randomBytes(3).toString('hex');
    	}
		socketCodes[roomCode] = io.sockets.sockets[socket.id];
		socket.roomCode = roomCode;
		
		// store the room name in the socket session for this client
		socket.room = roomCode;
	
		// send client to room "roomCode"
		socket.join(roomCode);
		// echo to client they've connected
		socket.emit('updatechat', username, 'you have connected to ' + roomCode);
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to(roomCode).emit('updatechat', username, username + ' has connected to this room');
		socket.emit('updaterooms', rooms, roomCode);
		socket.emit("roomCodeIs", roomCode);
	});
	
	socket.on('adduser',function(roomCode,username)
	{
		roomsusers[roomCode] += ','+username;
		socket.emit('useradded',roomsusers[roomCode]);
	});
	
	socket.on('join', function(joincode,username)
	{
		
		socket.join(joincode);
		socket.emit('updatechat', username, 'you have connected to ' + joincode);
		socket.broadcast.to(joincode).emit('updatechat', username, username + ' has connected to this room');
		socket.emit('updaterooms', rooms, joincode);
		socket.emit("roomCodeIs", joincode);
	});	


    
	//randurl= Math.floor((Math.random()*10)+1);    
	// Start listening for mouse move events
	socket.on('move', function (data,room) 
	{
		// This line sends the event (broadcasts it)
		// to everyone except the originating client.
		socket.broadcast.to(room).emit('moving', data);
	});

});
