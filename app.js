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
var rooms = {};//['room1','room2','room3'];

/*var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	static = require('node-static'); // for serving files*/

// This will make all the files in the current folder
// accessible from the web
//var fileServer = new static.Server('/assets/index.html');
	
// This is the port for our web server. you will need to go to http://localhost:8080 to see it
//app.listen(8080);

var randurl = '';
var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";
var requestedurl = '';
        
server.listen(process.env.C9_PORT || 8333); 

  
/*app.get('/', function (req, res)
{ 

  	randurl = '';
	for( var i=0; i < 10; i++ )
        randurl += possible.charAt(Math.floor(Math.random() * possible.length));
	
	var newserver = servernb;

	//res.redirect( '/' +randurl);
	//myData[newserver] = randurl;
	res.sendfile(__dirname + '/assets/index.html' );    

	//ECRIRE JSONFILE
     fs.writeFile(outputFilename, JSON.stringify(myData, null, 4), function(err) {
    	if(err) {
      	console.log(err);
    	} else {
      		//console.log("JSON saved to ");
    	}
	}); 
    //LIRE JSONFILE
    fs.readFile(outputFilename, 'utf8', function (err, data)
    {
        if (err)
        {
            console.log('Error: ' + err);
            return;
        }
                
        data = JSON.parse(data);
        //console.dir(data);
    });

	servernb+=1;
    roomhandler ();  
});*/

/*app.use(function(req, res, next){
    console.log(req.url);
});*/

/*app.get('/'+randurl, function(req, res) {
    res.sendfile(__dirname + '/assets/index.html' );    
});
*/

/*
app.get('/'+myData[newserver], function(req, res) {
    res.sendfile(__dirname + '/assets/index.html' );    
});
*/

/*app.get('/:randurl', function (req, res)
{
	res.sendfile(__dirname + '/assets/index.html' );    
});*/

/*app.get('/', function (req, res)
{
	res.sendfile(__dirname + '/draw/assets/index.html' );    
});*/ 

app.get('/', function (req, res)
{
	res.sendfile(__dirname + '/assets/index.html' );    
	
});
app.use(express.static(path.join(__dirname, '/assets')));

app.get('/img', function (req, res)
{
	res.sendfile(__dirname + '/assets/img' );    
	
});


// If the URL of the socket server is opened in a browser
/*function handler (request, response)
{

	request.addListener('end', function () {
        fileServer.serve(request, response);
    });
}*/
/*function roomhandler ()
{
	var i =0;
	for(i = 0; i<servernb;i++)
	{
		//roomname = JSON.parse(myData[i]);
		//console.log(myData[i]);

	}

}*/
// Delete this row if you want to see debug messages
io.set('log level', 1);

// Listen for incoming connections from clients
io.sockets.on('connection', function (socket) 
{
	socket.emit("welcome", {});

	/*socket.on('create', function(username)
	{
		
		var roomCode = crypto.randomBytes(3).toString('hex');
		while(roomCode in socketCodes)
    	{
       		roomCode = crypto.randomBytes(3).toString('hex');
    	}
		socketCodes[roomCode] = io.sockets.sockets[socket.id];
		socket.roomCode = roomCode;

		// store the username in the socket session for this client
		socket.username = username;
		// store the room name in the socket session for this client
		socket.room = roomCode;
		// add the client's username to the global list
		usernames[username] = username;
		// send client to room 1
		socket.join(roomCode);
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected to ' + roomCode);
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to(roomCode).emit('updatechat', 'SERVER', username + ' has connected to this room');
		socket.emit('updaterooms', rooms, roomCode);
		socket.emit("roomCodeIs", roomCode);
		
	});*/
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
		/*roomsusers.room.push(roomCode);
		roomsusers.name.push(username);
		//roomsusers.roomCode.push(username);	
		console.log(roomsusers);	
		console.log(roomsusers["room"]);
		for(var i = 0; i<roomsusers["room"].length,i++)
		{
			if(roomusers.room[i]==roomCode)
			{
				console.log(roomusers.name[i]);
			}
		}*/
		//roomsusers[roomCode]='';

		roomsusers[roomCode] += ','+username;
		socket.emit('useradded',roomsusers[roomCode]);
	//	console.log(roomsusers);
	});
	
	socket.on('join', function(joincode,username)
	{
		
		socket.join(joincode);
		socket.emit('updatechat', username, 'you have connected to ' + joincode);
		socket.broadcast.to(joincode).emit('updatechat', username, username + ' has connected to this room');
		socket.emit('updaterooms', rooms, joincode);
		socket.emit("roomCodeIs", joincode);
	});	


	//PAIR WITH CODE
   	/*socket.emit("welcome", {});
   	var gameCode = crypto.randomBytes(3).toString('hex');
	while(gameCode in socketCodes)
    {
       gameCode = crypto.randomBytes(3).toString('hex');
    }
    socketCodes[gameCode] = io.sockets.sockets[socket.id];
	socket.gameCode = gameCode;
    socket.emit("initialize", gameCode);
	if(device.gameCode in socketCodes)
	{
            // save the game code for controller commands
       socket.gameCode = device.gameCode
 
            // initialize the controller
       socket.emit("connected", {});
 
            // start the game
    	socketCodes[device.gameCode].emit("connected", {});
    }
    
         // else game code is invalid,
      //  send fail message and disconnect
    else
	{
        socket.emit("fail", {});
        socket.disconnect();
    }*/
    
	//randurl= Math.floor((Math.random()*10)+1);    
	// Start listening for mouse move events
	socket.on('move', function (data,room) 
	{
		// This line sends the event (broadcasts it)
		// to everyone except the originating client.
		socket.broadcast.to(room).emit('moving', data);
	});

});
