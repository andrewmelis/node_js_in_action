 //variable initializations
var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function(server) {
  io = socketio.listen(server);	    //start Socket.IO server, piggybacks on existing HTTP server
  io.set('log level', 1);

  io.sockets.on('connection', function (socket) {     //define how each user connectio will be handled
    guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);	//assign user a guest name when they connect
    joinRoom(socket, 'Lobby');		  //place user in Lobby upon intial connect

    handleMessageBroadcasting(socket, nickNames);     //handle user messages
    handleNameChangeAttempts(socket, nickNames, namesUsed); //name-change attempts
    handleRoomJoining(socket);	    //and room creation/changes

    socket.on('rooms', function() {	  //provide user with list of occupied rooms on request
      socket.emit('rooms', io.sockets.manager.rooms);
    });

    handleClientsDisconnection(socket, nickNames, namesUsed);	//cleanup logic when user disconnects
  });
};

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
  var name = 'Guest' + guestNumber;	//generate new guest name
  nickNames[socket.id] = name;		//associate guest name with client connection ID
  socket.emit('nameResult', {		//let the user know their guest name
    succes: true,			//does this use an anonymous function?
    name: name
  });
  namesUsed.push(name);			//note that guest name is now used
  return guestNumber + 1;		//increment increment counter used to generate guest names
};

function joinRoom(socket, room) {
  socket.join(room);			//make user join room. only requires built-in join() method of socket object
  currentRoom[socket.id] = room;	//user is now in this room. now updating other states to reflect this
  socket.emit('joinResult', {room: room});  //let the user know they're now in the new room
  socket.broadcast.to(room).emit('message', {
    text: nickNames[socket.id] + ' has joined ' + room + '.'  //tell other users in room know that user has joined
  });

  var usersInRoom = io.sockets.clients(room);	    //determine what other users are in same room as user

  if (usersInRoom.length > 1) {			    //if other users exist, summarize who they are
    var usersInRoomSummary = 'users currently in ' + room + ': ';
    for (var index in usersInRoom) {
      var userSocketId = usersInRoom[index].id;
      if (userSocketId != socket.id) {
	if (index > 0) {
	  usersInRoomSummary += ', ';
	}
	usersInRoomSummary += nickNames[userSocketId];
      }
    }
    usersInRoomSummary += '.';
    socket.emit('message', {text: usersInRoomSummary});	      //send summary of otheres users in the room to the user
  }
}

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
  socket.on('nameAttempt', function(name) {	    //add listener for nameAttempt events
    if(name.indexOf('Guest') == 0) {		    //don't allow nicknames to begin with 'Guest'
      socket.emit('nameResult', {
	success: false,
	message: 'Names cannot begin with "Guest".'
      });
    } else {
      if (namesUsed.indexOf(name) == -1) {	//if name isn't already registered, register it
	var previousName = nickNames[socket.id];
	var previousNameIndex = namesUsed.indexOf(previousName);
	namesUsed.push(name);
	nickNames[socket.id] = name;

	delete namesUsed[previousNameIndex];	  //remove previous name to make available to other clients
	socket.emit('nameResult', {
	  success: true,
	  name: name
	});
	socket.broadcast.to(currentRoom[socket.id]).emit('message', {	//alert rest of room of name change
	  text: previousName + ' is now known as ' + name + '.'
	});
      } else {
	socket.emit('nameResult', {		  //send error to client if name is already registered
	  success: false,
	  message: 'that name is already in use.'
	});
      }
    }
  });
}

function handleMessageBroadcasting(socket) {
  socket.on('message', function(message) {
    socket.broadcast.to(message.room).emit('message', {
      text: nickNames[socket.id] + ':' + message.text
    });
  });
}

function handleRoomJoining(socket) {
  socket.on('join', function(room) {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom);
  });
}

function handleClientsDisconnection(socket) {
  socket.on('disconnect', function() {
    var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  });
}
