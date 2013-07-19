// Including libraries

var express = require('express'),
	http = require('http'),
	app = express(),
	server = http.createServer(app),
	path = require('path'),
	url = require('url'),
	fs = require('fs'),
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
var myData = {
  server:'test'
}
/*var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	static = require('node-static'); // for serving files*/

// This will make all the files in the current folder
// accessible from the web
//var fileServer = new static.Server('/assets/index.html');
	
// This is the port for our web server. you will need to go to http://localhost:8080 to see it
//app.listen(8080);
var randurl = "";
//var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
/*for( var i=0; i < 5; i++ )
        randurl += possible.charAt(Math.floor(Math.random() * possible.length));
        */
randurl= Math.floor((Math.random()*10)+1);    
server.listen(process.env.C9_PORT || 8333); 


app.get('/', function (req, res)
{ 
	var newserver = "server"+servernb;
	res.redirect( '/' +randurl);
	fs.writeFile(outputFilename, JSON.stringify(myData, null, 4), function(err) {
    	if(err) {
      	console.log(err);
    	} else {
      	console.log("JSON saved to ");
    	}
	}); 
	
	myData[newserver] = randurl;
	servernb+=1;
        
    //LIRE JSONFILE
    fs.readFile(outputFilename, 'utf8', function (err, data)
    {
        if (err)
        {
            console.log('Error: ' + err);
            return;
        }
                
        data = JSON.parse(data);
        console.dir(data);
    });
        
        
        
        
}); 

app.get('/', function (req, res)
{ 
    res.sendfile(__dirname + '/assets/index.html' );    
}
/*app.get('/'+randurl, function(req, res) {
    res.sendfile(__dirname + '/assets/index.html' );    
});
*/
        /*
app.get('/'+myData[newserver], function(req, res) {
    res.sendfile(__dirname + '/assets/index.html' );    
});
*/


app.use(express.static(path.join(__dirname, 'assets')));

//app.use(express.static(path.join(__dirname, randurl)));

// If the URL of the socket server is opened in a browser
/*function handler (request, response)
{

	request.addListener('end', function () {
        fileServer.serve(request, response);
    });
}*/

// Delete this row if you want to see debug messages
io.set('log level', 1);

// Listen for incoming connections from clients
io.sockets.on('connection', function (socket) 
{
randurl= Math.floor((Math.random()*10)+1);    
	// Start listening for mouse move events
	socket.on('move', function (data) 
	{
		
		// This line sends the event (broadcasts it)
		// to everyone except the originating client.
		socket.broadcast.emit('moving', data);
	});

});
