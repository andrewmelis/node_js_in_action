//JS equivalent of a "class"
//takes single argument, a Socket.IO socket
var Chat = function(socket) {
  this.socket = socket;
});

//sends chat messages
Chat.prototype.sendMessage = function(room, text) {
  var message = {
    room: room,
    text: text
  };
  this.socket.emit('message', message);
};

//change room functionality
Chat.prototype.changeRoom = function(room) {
  this.socket.emit('join', {
    newRoom: room
  });
};

//process chat commands
Chat.prototype.processCommand = function(command) {
  var words = command.split(' ');
  var command = words[0]    //parse command from first word
		  .substring(1, words[0].length)
		  .toLowerCase();
  var message = false;

  switch(command) {
    case 'join':
      words.shift();	//removes first index
      var room = words.join(' ');
      this.changeRoom(room);	//handle room change/create
      break;
    case 'nick':
      words.shift();
      var name = words.join(' ');
      this.socket.emit('nameAttempt', name); //handle name change request
      break;
    default:	    //returns error if command isn't recognized
      message = 'Unrecognized command.';
      break;
  }

  return message;
};

      

