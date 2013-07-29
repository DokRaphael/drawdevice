$(function(){
	// This demo depends on the canvas element
	if(!('getContext' in document.createElement('canvas'))){
	
		alert('Sorry, it looks like your browser does not support canvas!');
		return false;
	}

        
	// The URL of your web server (the port is set in app.js)
	
	//var url = 'http://localhost/';
	var url = 'http://ec2-54-229-102-239.eu-west-1.compute.amazonaws.com/draw';
	var doc = $(document),
		win = $(window),
		canvas = $('#paper'),
		ctx = canvas[0].getContext('2d'),
		instructions = $('#instructions');
	
	// Generate an unique ID
	var id = Math.round($.now()*Math.random());
	
	// A flag for drawing activity
	var drawing = false;
	var clients = {};
	var cursors = {};
	var lastEmit = $.now();
	var down = false;
	var socket = io.connect(url);
	var up = false;
	var prev = {};
	doc.ready(function() {
    			var canvas = document.getElementById('paper');
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
				canvas.style.backgroundImage="url('../img/bg.png')";

				prev.x = 0;
				prev.y = 0;
    		});
    		
    		
    		
	socket.on('moving', function (data) 
	{
		
		if(! (data.id in clients))
		{
			// a new user has come online. create a cursor for them
			cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
		}
		
		// Move the mouse pointer
		cursors[data.id].css(
		{
			'left' : data.x,
			'top' : data.y
		});
		
		// Is the user drawing?
		if(down)
		{
			clients[data.id] = data;
		}
		if(data.drawing && clients[data.id])
		{
			
			// Draw a line on the canvas. clients[data.id] holds
			// the previous position of this user's mouse pointer
			
			drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);

		}
		
		/*if(up)
		{
			clients[data.id].x = prev.x;
			clients[data.id].y = prev.y;

		} */
	
	
			clients[data.id] = data;
		
		// Saving the current client state
		clients[data.id].updated = $.now();

		
	});


	
	canvas.on('mousedown',function(e){
		e.preventDefault();
		prev.x = e.pageX;
		prev.y = e.pageY;
		drawing = true;

		// Hide the instructions
		instructions.fadeOut();
	});
	
	
	canvas.on("touchstart", function(e){
		down = true;
		up = false;
		e.preventDefault();
		prev.x = e.originalEvent.touches[0].pageX;
		prev.y = e.originalEvent.touches[0].pageY;
		drawing = true;
		

		socket.emit('move',
			{
				'x': prev.x,
				'y': prev.y,
				'drawing': false,
				'id': id
			});
		// Hide the instructions
		instructions.fadeOut();
	});
	



	doc.on('mousemove',function(e)
	{
		
		if($.now() - lastEmit > 3)
		{
			socket.emit('move',
			{
				'x': e.pageX,
				'y': e.pageY,
				'drawing': drawing,
				'id': id
			});
			lastEmit = $.now();
		}
		
		// Draw a line for the current user's movement, as it is
		// not received in the socket.on('moving') event above
		

		if(drawing)
		{		
			drawLine(prev.x, prev.y, e.pageX, e.pageY);
			
			prev.x = e.pageX;
			prev.y = e.pageY;
		}
	});
	
	
	$('body').on('touchmove', function(evt) {
    evt.preventDefault(); 
	})
	
	doc.on('touchmove',function(e)
	{
	down = false;

		up = false;
		e.preventDefault();
		
		if($.now() - lastEmit > 3)
		{
			socket.emit('move',
			{
				'x': e.originalEvent.touches[0].pageX,
				'y': e.originalEvent.touches[0].pageY,
				'drawing': drawing,
				'id': id
			});
			lastEmit = $.now();
		}
	
		// Draw a line for the current user's movement, as it is
		// not received in the socket.on('moving') event above
		

		if(drawing)
		{	
			drawLine(prev.x, prev.y, e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY);

			prev.x = e.originalEvent.touches[0].pageX;
			prev.y = e.originalEvent.touches[0].pageY;
			
		}
	});
	
	doc.bind('mouseup mouseleave',function(){
	drawing = false;
		
	});
	doc.bind('touchend',function(){
	down = false;

		up = true;
		drawing = false;
		/*socket.emit('move',
			{
				'x': e.originalEvent.touches[0].pageX,
				'y': e.originalEvent.touches[0].pageY,
				'drawing': drawing,
				'id': id
			});*/
	});

	// Remove inactive clients after 10 seconds of inactivity
	setInterval(function(){
		
		for(ident in clients){
			if($.now() - clients[ident].updated > 10000){
				
				// Last update was more than 10 seconds ago. 
				// This user has probably closed the page
				
				cursors[ident].remove();
				delete clients[ident];
				delete cursors[ident];
			}
		}
		
	},10000);

	function drawLine(fromx, fromy, tox, toy){
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.stroke();
	}
	

});