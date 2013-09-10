//HELPER FUNCTIONS
function divEscapedContentElement(message) {
  console.log("in divEscapedContentElement " + message);
  return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
  console.log("in divSystemContentElement " + message);
  return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chatApp, socket) {
  console.log("in processUserInput--chatApp " + chatApp + " socket " + socket);
  var message = $('#send-message').val();
  var systemMessage;

  if (message[0] == '/') {     //if user input begins with a slash, treat as a command
  //if (message.charAt(0) == '/') {     //if user input begins with a slash, treat as a command
    systemMessage = chatApp.processCommand(message);
    if (systemMessage) {
      console.log("in processUserInput--systemMessage " + systemMessage);
      $('#messages').append(divSystemContentElement(systemMessage));
    }
  } else {
    console.log("in processUserInput--systemMessage was false--message " + message);
    chatApp.sendMessage($('#room').text(), message);	      //broadcast noncommand input to other users
    $('#messages').append(divEscapedContentElement(message));
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
  }

  $('#send-message').val('');
}

//client-side application initialization logic
var socket = io.connect();

$(document).ready(function() {
  console.log("in doc ready");
  var chatApp = new Chat(socket);

  socket.on('nameResult', function(result) {	  //display result of name-change attempt
    var message;

    if (result.success) {
      message = 'You are now known as ' + result.name + '.';
    } else {
      message = result.message;
    }
    $('#messages').append(divSystemContentElement(message));
    console.log("after name result " + message);
  });

  socket.on('joinResult', function(result) {
    $('#room').text(result.room);
    $('#messages').append(divSystemContentElement('Room changed.'));
    console.log("after join result " + result);
  });

  socket.on('message', function(message) {
    var newElement = $('<div></div>').text(message.text);
    $('#messages').append(newElement);
    console.log("after message result " + message);
  });

  socket.on('rooms', function(rooms) {
    $('#room-list').empty();

    for(var room in rooms) {
      room = room.substring(1, room.length);
      if (room != '') {
	$('#room-list').append(divEscapedContentElement(room));
      }
      console.log("in rooms " + room);
    }

    $('#room-list div').click(function() {
      chatApp.processCommand('/join ' + $(this).text());
      $('#send-message').focus();
    });
  });

  setInterval(function() {
    socket.emit('rooms');
  }, 1000);

  $('#send-message').focus();

  $('#send-form').submit(function() {
    processUserInput(chatApp, socket);
    return false;
  });
});
