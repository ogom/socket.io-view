$(function() {
  
  var roomSocket = io.connect('/room');
  
  roomSocket.on('connect', function () {
    console.log('view socket connected');
  });
  
  roomSocket.on('socketId', function(socket) {
    console.log('socket id is ' + socket.id);
    $('#socketId').text(socket.id);
  });
  
  roomSocket.on('connectAllCount', function(connect) {
    console.log('connect all count ' + connect.count);
    $('#connectAllCount').text(connect.count);
  });
  
  roomSocket.on('connectRoomCount', function(connect) {
    console.log('connect room count ' + connect.count);
    $('#connectRoomCount').text(connect.count);
  });
  
  roomSocket.on('roomMessage', function(message) {
     console.log('socket.on roomMessage');
    $('#messageList').append($('<div>' + time() + ' /room/' + message.name + ':' + message.text + '</div><hr>'));
  });
  
  roomSocket.on('disconnect', function() {
    console.log('room socket disconnected');
  });
  
  $('#joinButton').click(function(e) {
    console.log('join button click');
    roomSocket.emit('roomJoin', $('#nameInput').val());
  });
  
  $('#leaveButton').click(function(e) {
    console.log('leave button click');
    roomSocket.emit('roomLeave');
  });
  
  $('#messageButton').click(function(e) {
    console.log('message button click');
    roomSocket.emit('roomMessage', $('#textInput').val());
  });
  
});


function time() {
  var date = new Date();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();

  if (hours < 10) { hours = '0' + hours; }
  if (minutes < 10) { minutes = '0' + minutes; }
  if (seconds < 10) { seconds = '0' + seconds; }

  return hours + ':' + minutes + ':' + seconds;
}