var net = require('net');

var server,
    sockets = [],
    port = 4000;

server = net.createServer({ allowHalfOpen: false}, function (socket) {
  console.log('Connected: ' + socket.remoteAddress + ':' + socket.remotePort); 
  socket.write('Hello ' + socket.remoteAddress + ':' + socket.remotePort + '\n');
  sockets.push(socket);
  console.log(sockets.length);
  
  socket.on('end', function() { // client disconnects
    console.log('Disconnected: ' + socket.remoteAddress + ':' + socket.remotePort + '\n');
    var idx = sockets.indexOf(socket);
    // console.log(idx, socket.remoteAddress + ':' + socket.remotePort);
    if (idx != -1) {
      // delete sockets[idx];
      sockets.splice(idx, 1);
    }
  });
});

server.listen(port);

server.on('error', function (e) {
  if (e.code == 'EADDRINUSE') {
    console.log('Address in use, retrying...');
    setImmediate(function () {
      server.close();
      server.listen(port);
    });
  }
});

setTimeout(function () {
  console.log('ttttt');
  var len = sockets.length;
  for (var i = 0; i < len; i ++) { // broad cast
    if (sockets[i]) {
        sockets[i].write(sockets[i].remoteAddress + ':' + sockets[i].remotePort + ':' + 'test' + '\n');
    }
  }
}, 3000);

