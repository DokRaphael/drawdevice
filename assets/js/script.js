$(function()
{
	// This demo depends on the canvas element
	if(!('getContext' in document.createElement('canvas')))
	{
		alert('Sorry, it looks like your browser does not support canvas!');
		return false;
	}

        
	// The URL of your web server (the port is set in app.js)
	
	var url = 'http://ec2-54-229-102-239.eu-west-1.compute.amazonaws.com';
	//var url = 'http://127.0.0.1/';
	var doc = $(document),
		win = $(window),
		canvas = $('#paper'),
		validator = $('#validator'),
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
	var prevac = {};
	var elYpos;
	var elXpos;
	var windowsSizeX ;
	var windowsSizeY ;
	var mobile   = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent); 
	var start = mobile ? "touchstart" : "mousedown";
	var roomcreated = false;
	var roomjoined = false;
	var username = '';
	var roomName ='';
	var toolong = false;
	//example touch + click (android takes both so .bind('touchstart' 'mousedown') fire twice on android).
	//$("#roll").bind(start, function(event){
	doc.ready(function() 
	{
				$('#baniere').hide();

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
				canvas.style.left = (window.innerWidth-document.getElementById('paper').offsetWidth)/2 +"px";
				canvas.style.top = (window.innerHeight-document.getElementById('paper').offsetHeight)/2 +"px";				
				canvas.style.backgroundImage = "url('../../img/bg.png')";
				
				//INIT
				prev.x = 0;
				prev.y = 0;
				prevac.x = 0;
				prevac.y = 0;
				elYpos = document.getElementById('paper').offsetTop/document.getElementById('paper').offsetHeight ; 
				elXpos = document.getElementById('paper').offsetLeft/document.getElementById('paper').offsetWidth; 
				$('#paper').hide();
				
	});
    var focus = function(e) {
        e.stopPropagation();
        e.preventDefault();
        var clone = input.cloneNode(true);
        var parent = input.parentElement;
        parent.appendChild(clone);
        parent.replaceChild(clone, input);
        input = clone;
        window.setTimeout(function() {
          input.value = input.value || "";
          input.focus();
        }, 0);
      }
    $('#usernamebox').keypress(function(e) { 
    	if($('#usernamebox').val().length >0 && $('#usernamebox').val().length <5)
    	{
			validator.css("background-image", "url(../../img/valid.png)"); 
			toolong = false;
    	}
    	if($('#usernamebox').val().length >5)
    	{
    		validator.css("background-image", "url(../../img/unvalid.png)"); 
    		$('#lengthError').remove();
    		$('#validator').append('<h2 id="lengthError">too long</h2>&nbsp;&nbsp;');
    		toolong = true;
    	}
    });
 	$("#entercode").bind(start, function(event)
  	{			
  		$("#entercode").focus();
	});
 	$("#usernamebox").bind(start, function(event)
  	{	
  		$("#usernamebox").focus();		
	});
  	$("#joinbutton").bind(start, function(event)
  	{		
  		socket.emit('username',  username = $('#usernamebox').val());
		
  		if(username != '' && username != 'USERNAME' && !toolong )
  		{	
  			
			var joincode = $('#entercode').val();
			$('#init').hide();
			$('#paper').show();
			$('#baniere').show();

			if(joincode != "CODE HERE" && joincode !="" && !toolong)
			{
				socket.emit('join',joincode,username);
				roomName = joincode;
			}
			else
			{
				validator.css("background-image", "url(../../img/unvalid.png)"); 
				//alert('enter a valid code');
			}
		}
  		else
  		{
  			validator.css("background-image", "url(../../img/unvalid.png)"); 
  			//alert("enter username");
  		}
  	});
  	$("#createbutton").bind(start, function(event)
  	{
  		socket.emit('username',  username = $('#usernamebox').val());

  		if(username != '' && username != 'USERNAME' && !toolong)
  		{
  			
			roomcreated = true;
			$('#init').hide();
			$('#paper').show();		
			$('#baniere').show();

			// listener, whenever the server emits 'updaterooms', this updates the room the client is in
			//socket.emit('create',  prompt("ID"));
			socket.emit('create',username);

  		}
  		else
  		{
  			validator.css("background-image", "url(../../img/unvalid.png)"); 
  			//alert("enter username");
  		}
  	});
  	
  	socket.on('useradded',function(roomsusers,roomCode)
  	{
  		var arr = {};
  		arr = roomsusers.split(",");
  		console.log(arr);
  		for(var i = 0; i<arr.length-1; i++)
  		{
  			if(i>0)
  			{
  				$('#connectedPeople').append('<h id="all"><h1 id="one"><h2 id="usermini">'+arr[i]+'<h2></h1></h>');
  			}
  		}
  	});
  	socket.on("roomCodeIs", function(roomCode)
    {	
        $("#gameConnect").show();
     	$("#socketId").html(roomCode);
     	$("#gameConnect").html("CODE : " + roomCode);
     	roomName = roomCode;
     	socket.emit('adduser',roomCode,username);

  	});
	
 	socket.on('updatechat', function (username, data) 
  	{
  		//affiche le flux de connexion des personnes
		//$('#conversation').append('<b>'+username + ':</b> ' + data + '<br>');
		$('#connectedPeople').append('<h id="all"><h1 id="one"><h2 id="usermini">'+username+'<h2></h1></h>');

	});
	socket.on('updaterooms', function(rooms, current_room) 
	{
		$('#rooms').empty();
		//$('<div id="one">').appendTo('#connectedPeople');

	});
  	
	socket.on('moving', function (data) 
	{
		if(! (data.id in clients))
		{
			// a new user has come online. create a cursor for them
			//cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
		}
		
		// Move the mouse pointer
	/*	cursors[data.id].css(
		{
			'left' : data.x,
			'top' : data.y
		});*/
		
		// Is the user drawing?
		if(down)
		{
			clients[data.id] = data;
		}
		if(data.drawing && clients[data.id])
		{
			// Draw a line on the canvas. clients[data.id] holds
			// the previous position of this user's mouse pointer
			drawLine(
				canvas.width() * clients[data.id].x - elXpos,
				canvas.height() * clients[data.id].y - elYpos, 
				data.x * canvas.width() - elXpos, 
				data.y * canvas.height() - elYpos
			);
		}

		clients[data.id] = data;
		// Saving the current client state
		clients[data.id].updated = $.now();
	});
	
	canvas.on('mousedown',function(e)
	{
		e.preventDefault();
		prev.x =  (e.pageX) / canvas.width() - elXpos;
		prev.y = (e.pageY)/ canvas.height() - elYpos;
		prevac.x = e.pageX - elXpos * document.getElementById('paper').offsetWidth;
		prevac.y = e.pageY - elYpos * document.getElementById('paper').offsetHeight; 
		drawing = true;

		// Hide the instructions
		instructions.fadeOut();
	});
	
	canvas.on("touchstart", function(e)
	{	
		
		down = true;
		up = false;
		e.preventDefault();
		prev.x =  (e.originalEvent.touches[0].pageX ) / canvas.width() - elXpos;
		prev.y =  (e.originalEvent.touches[0].pageY ) / canvas.height() - elYpos;
		prevac.x = e.originalEvent.touches[0].pageX - elXpos * document.getElementById('paper').offsetWidth;
		prevac.y = e.originalEvent.touches[0].pageY - elYpos * document.getElementById('paper').offsetHeight;
		
		
		
		drawing = true;

		socket.emit('move',
		{
			'x':  prev.x,
			'y':  prev.y,
			'drawing': false,
			'id': id
		},roomName);
		// Hide the instructions
		instructions.fadeOut();
	});
	
	doc.on('mousemove',function(e)
	{
		if($.now() - lastEmit > 3)
		{
			socket.emit('move',
			{
				'x': (e.pageX)/ canvas.width()  - elXpos,
				'y': (e.pageY)/ canvas.height() - elYpos,
				'drawing': drawing,
				'id': id
				
			},roomName);
			lastEmit = $.now();
		}
		
		// Draw a line for the current user's movement, as it is
		// not received in the socket.on('moving') event above
		
		if(drawing)
		{		
			drawLine( 
				prev.x,  
				prev.y, 
				(e.pageX)/ canvas.width() - elXpos, 
				(e.pageY)/ canvas.height() - elYpos
				);	
					
			drawLine(
				prevac.x, 
				prevac.y, 
				e.pageX- elXpos * document.getElementById('paper').offsetWidth, 
				e.pageY- elYpos * document.getElementById('paper').offsetHeight
				);
				
			prevac.x = e.pageX - elXpos * document.getElementById('paper').offsetWidth;
			prevac.y = e.pageY - elYpos * document.getElementById('paper').offsetHeight;
			prev.x = (e.pageX) / canvas.width() - elXpos;
			prev.y =(e.pageY) / canvas.height() - elYpos;
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
				'x': (e.originalEvent.touches[0].pageX )/ canvas.width() -  elXpos ,
				'y': (e.originalEvent.touches[0].pageY )/ canvas.height()- elYpos,
				'drawing': drawing,
				'id': id
			},roomName);
			lastEmit = $.now();
		}
	
		// Draw a line for the current user's movement, as it is
		// not received in the socket.on('moving') event above
		

		if(drawing)
		{	
			drawLine(
				prev.x, 
				prev.y, 
				(e.originalEvent.touches[0].pageX )/ canvas.width()- elXpos, 
				(e.originalEvent.touches[0].pageY )/ canvas.height()- elYpos
				);
				
			drawLine(
				prevac.x, 
				prevac.y, 
				(e.originalEvent.touches[0].pageX - elXpos * document.getElementById('paper').offsetWidth), 
				e.originalEvent.touches[0].pageY - elYpos * document.getElementById('paper').offsetHeight);

			prevac.x = e.originalEvent.touches[0].pageX - elXpos * document.getElementById('paper').offsetWidth;
			prevac.y = e.originalEvent.touches[0].pageY - elYpos * document.getElementById('paper').offsetHeight;
			prev.x = (e.originalEvent.touches[0].pageX)/ canvas.width() - elXpos;
			prev.y = (e.originalEvent.touches[0].pageY)/ canvas.height() - elYpos;
			
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
				//cursors[ident].remove();
				delete clients[ident];
				//delete cursors[ident];
			}
		}
	},10000);

	function drawLine(fromx, fromy, tox, toy)
	{
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.stroke();
	}

});

/*function make_blank()
{
	document.form1.type.value ="";
}
function make_blank2()
{
	document.form2.type2.value ="";
}
*/