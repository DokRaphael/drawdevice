$(function()
{
	// This demo depends on the canvas element
	if(!('getContext' in document.createElement('canvas')))
	{
		alert('Sorry, it looks like your browser does not support canvas!');
		return false;
	}

        
	// The URL of your web server (the port is set in app.js)
	
	var url = 'http://ec2-54-229-102-239.eu-west-1.compute.amazonaws.com/';
	//var url = 'http://127.0.0.1/';
	var doc = $(document),
		win = $(window),
		canvas = $('#paper'),
		ctx = canvas[0].getContext('2d'),
		instructions = $('#instructions');
	
	// Generate an unique ID
	var id = Math.round($.now()*Math.random());
	console.log(canvas.width());
	// A flag for drawing activity
	var drawing = false;
	var clients = {};
	var cursors = {};
	var lastEmit = $.now();
	var down = false;
	var socket = io.connect(url);
	var up = false;
	var prev = {};
	var prevac = {};

	var windowsSizeX ;
	var windowsSizeY ;

	doc.ready(function() 
	{
    			var canvas = document.getElementById('paper');

				windowsSizeX = window.screen.availWidth;
				windowsSizeY = window.screen.availHeight;
    			/*switch(window.orientation) 
				{  
				  case -90:
				  case 90:
					canvas.width = windowsSizeY*0.8;
					canvas.height = windowsSizeX*0.8;          
					break; 
				  default:
					canvas.width = windowsSizeX*0.8;
					canvas.height = windowsSizeY*0.8;          
					break; 
				}*/
				//RATIO ECRAN
				var ratio1 = window.innerWidth / window.innerHeight;
				var ratio2 = canvas.width / canvas.height;
				
				if (ratio1 < ratio2) {
					canvas.width = window.innerWidth*0.9;
					canvas.height = canvas.width * 0.8;
				}
				else {
					canvas.height = window.innerHeight*0.9;
					canvas.width = canvas.height / 0.8;
				}
				
				//CENTER CANVAS
				//canvas.style.left = (window.innerWidth-document.getElementById('paper').offsetWidth)/2 +"px";
				//canvas.style.top = (window.innerHeight-document.getElementById('paper').offsetHeight)/2 +"px";
				canvas.style.backgroundImage = "url('../../img/bg.png')";
				
				//INIT
				prev.x = 0;
				prev.y = 0;
				prevac.x = 0;
				prevac.y = 0;
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
			drawLine(canvas.width() * clients[data.id].x,canvas.height() * clients[data.id].y, data.x * canvas.width(), data.y * canvas.height());
		}
		/*if(up)
		{
			clients[data.id].x = prev.x;
			clients[data.id].y = prev.y;

		} */
	/*	clients[data.id].w = document.getElementById('paper').width;
		clients[data.id].h = document.getElementById('paper').height;*/

		clients[data.id] = data;
		// Saving the current client state
		clients[data.id].updated = $.now();
	});
	
	canvas.on('mousedown',function(e){
		e.preventDefault();
		//prev.x =100 * (e.pageX - document.getElementById('paper').offsetLeft)/ $('paper').width();
		//prev.y =100 * (e.pageY - document.getElementById('paper').offsetTop)/ $('paper').height();
		prev.x =  (e.pageX / canvas.width());
		prev.y = (e.pageY)/ canvas.height();
		prevac.x =  (e.pageX );
		prevac.y = (e.pageY);
		drawing = true;

		// Hide the instructions
		instructions.fadeOut();
	});
	
	canvas.on("touchstart", function(e)
	{	
		
		down = true;
		up = false;
		e.preventDefault();
		prev.x =  (e.originalEvent.touches[0].pageX / canvas.width());
		prev.y =  (e.originalEvent.touches[0].pageY / canvas.height());
		prevac.x = e.originalEvent.touches[0].pageX;
		prevac.y = e.originalEvent.touches[0].pageY;
		console.log(prev.x);
		drawing = true;

		socket.emit('move',
		{
				/*'x': 100 * prev.x / document.getElementById('paper').width,
				'y': 100 * prev.y / document.getElementById('paper').height,*/
				'x':  prev.x,
				'y':  prev.y,
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
				/*'x':100* (e.pageX ) / document.getElementById('paper').width,
				'y':100* (e.pageY) / document.getElementById('paper').height,*/
				'x':e.pageX/ canvas.width(),
				'y': e.pageY/ canvas.height(),
				'drawing': drawing,
				'id': id
				
			});
			lastEmit = $.now();
		}
		
		// Draw a line for the current user's movement, as it is
		// not received in the socket.on('moving') event above
		
		if(drawing)
		{		
			drawLine( prev.x,  prev.y, e.pageX/ canvas.width(), e.pageY/ canvas.height());	
			drawLine(prevac.x, prevac.y, e.pageX, e.pageY);
			prevac.x = e.pageX;
			prevac.y = e.pageY;
			prev.x = e.pageX/ canvas.width();
			prev.y =e.pageY/ canvas.height();
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
				/*'x': 100*(e.originalEvent.touches[0].pageX) / document.getElementById('paper').width,
				'y': 100*(e.originalEvent.touches[0].pageY) / document.getElementById('paper').height,*/
				'x': e.originalEvent.touches[0].pageX/ canvas.width(),
				'y': e.originalEvent.touches[0].pageY/ canvas.height(),
				'drawing': drawing,
				'id': id
			});
			lastEmit = $.now();
		}
	
		// Draw a line for the current user's movement, as it is
		// not received in the socket.on('moving') event above
		

		if(drawing)
		{	
			drawLine(prev.x, prev.y, e.originalEvent.touches[0].pageX/ canvas.width(), e.originalEvent.touches[0].pageY/ canvas.height());
			drawLine(prevac.x, prevac.y, e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY);

			prevac.x = e.originalEvent.touches[0].pageX;
			prevac.y = e.originalEvent.touches[0].pageY;
			prev.x = e.originalEvent.touches[0].pageX/ canvas.width();
			prev.y = e.originalEvent.touches[0].pageY/ canvas.height();
			
		}
	});
	
	doc.bind('mouseup mouseleave',function()
	{
		drawing = false;	
	});
	doc.bind('touchend',function()
	{
		down = false;
		up = true;
		drawing = false;
	});

	// Remove inactive clients after 10 seconds of inactivity
	setInterval(function()
	{
		for(ident in clients)
		{
			if($.now() - clients[ident].updated > 10000)
			{
				
				// Last update was more than 10 seconds ago. 
				// This user has probably closed the page
				
				cursors[ident].remove();
				delete clients[ident];
				delete cursors[ident];
			}
		}
	},10000);

	function drawLine(fromx, fromy, tox, toy)
	{
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.stroke();
		//console.log(tox + "//" + toy);
	}
});