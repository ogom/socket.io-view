
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  
  //app.use(express.cookieParser());
  //app.use(express.session({secret:'secret', key:'express.sid'}));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('view', {
    title: 'socket.io view'
  });
  // req.session.hoge = 'hogehoge';
});

app.get('/room', function(req, res){
  res.render('room', {
      title: 'namespace room'
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// Server

var io = require('socket.io').listen(app);

var viewSocket = io.of('/view').on('connection', function(socket) {
  console.log('view socket connected', socket.id);
  viewSocket.socket(socket.id).json.emit('socketId', {id: socket.id});
  viewSocket.json.emit('connectAllCount', {count: io.sockets.clients().length});
  viewSocket.json.emit('connectViewCount', {count: viewSocket.clients().length});
  storeReload();
  
  socket.on('disconnect', function() {
    console.log('view socket disconnected', socket.id);
    viewSocket.json.emit('connectAllCount', {count: io.sockets.clients().length-1});
    viewSocket.json.emit('connectViewCount', {count: viewSocket.clients().length-1});
    storeReload();
  });
});

var roomSocket = io.of('/room').on('connection', function(socket) {
  console.log('room socket connected', socket.id);
  roomSocket.socket(socket.id).json.emit('socketId', {id: socket.id});
  viewSocket.json.emit('connectAllCount', {count: io.sockets.clients().length});
  roomSocket.json.emit('connectAllCount', {count: io.sockets.clients().length});
  roomSocket.json.emit('connectRoomCount', {count: roomSocket.clients().length});
  storeReload();

  socket.on('roomJoin', function(name) {                                                        
    console.log('room join', socket.id);                                                           
    socket.set('roomName', name);                                                               
    socket.join(name);
    storeReload();
    var message = {
        name: name
      , text: 'it is room join'
    }
    roomSocket.in(name).emit("roomMessage", message);                                                                              
  });                                                                                           

  socket.on('roomLeave', function() {
    console.log('roomLeave', socket.id);
    socket.get('roomName', function(err, name) {
      socket.leave(name);
      storeReload();
    });
  });

  socket.on('roomMessage', function(text) {
    socket.get('roomName', function(err, name) {
      console.log('room message', socket.id, name);
      var message = {
          name: name
        , text: text
      }
      roomSocket.in(name).emit("roomMessage", message);
    });
  });

  socket.on('disconnect', function() {
    console.log('room socket disconnected', socket.id);
    viewSocket.json.emit('connectAllCount', {count: io.sockets.clients().length-1});
    roomSocket.json.emit('connectAllCount', {count: io.sockets.clients().length-1});
    roomSocket.json.emit('connectRoomCount', {count: roomSocket.clients().length-1});
    
    socket.get('roomName', function(err, name) {
      socket.leave(name);
    });
    storeReload();
  });
});

function storeReload() {
  console.log('store reload');
  viewSocket.json.emit('storeRemove');
  
  var store = io.store;
  for (var key in store.manager.rooms) {
    for (var i in store.manager.rooms[key]) {
      if (key) {
        var room = {
            name: key
          , client: store.manager.rooms[key][i]
        }
        viewSocket.json.emit("storeAppend", room);  
      }
    }
  }
}
