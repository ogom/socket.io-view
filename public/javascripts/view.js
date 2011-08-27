$(function() {
  
  var viewSocket = io.connect('/view');
  
  viewSocket.on('connect', function () {
    console.log('view socket connected');
  });
  
  viewSocket.on('socketId', function(socket) {
    console.log('socket id is ' + socket.id);
    $('#socketId').text(socket.id);
  });
  
  viewSocket.on('connectAllCount', function(connect) {
    console.log('connect all count ' + connect.count);
    $('#connectAllCount').text(connect.count);
  });
  
  viewSocket.on('connectViewCount', function(connect) {
    console.log('connect view count ' + connect.count);
    $('#connectViewCount').text(connect.count);
  });
  
  viewSocket.on('storeRemove', function() {
    console.log('socket.on storeRemove');
    $('#storeList').children().remove();
  });  

  viewSocket.on('storeAppend', function(room) {
    console.log('socket.on storeAppend');
    $('#storeList').append($('<div>' + room.name + ':' + room.client + '</div><hr>'));
  });

  viewSocket.on('disconnect', function() {
    console.log('view socket disconnected');
  });

});