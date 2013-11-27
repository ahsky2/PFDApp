(function() {
  var SocketIL = (function() {
    var IL = require('infinite-loop'),
        Step = require('step'),
        fs = require('fs'),
        path = require('path'),
        net = require('net'),
        config = require('./config'),
        FBPagePhoto = require('./FBPagePhoto');

    var il,
        bRunning = false,
        processUrl = config.process.url,
        server,
        sockets = [],
        port = config.process.port
        trgCount = config.process.count;

    function init() {
      server = net.createServer({ allowHalfOpen: true}, function (socket) {
        console.log('Connected: ' + socket.remoteAddress + ':' + socket.remotePort); 
        socket.write('Hello ' + socket.remoteAddress + ':' + socket.remotePort + '\n');
        sockets.push(socket);
        // console.log(sockets.length);

        Step(
        function () {
          FBPagePhoto.init(this);
        },
        function () {
          FBPagePhoto.get('NOTIFIED', this);
        },
        function (rows) {
          rows.forEach(function (row) {
            var url = row.src;

            sockets.forEach(function (socket) {
              // console.log(Math.floor(Math.random()*5));
              var data = processUrl + row.object_id + '_' + row.width + 'x' + row.height + '_' + (Math.floor(Math.random()*5)+100).toString().substring(1) + url.substr(url.lastIndexOf(".")) + '\n';

              socket.write(data, function () {});
            });
          });
        }
      );
        
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

      il = new IL();

      il.onError(function (err) {
        console.log(err);;
      });

      il.setInterval(10*1000);

      il.add(processing);
    }

    function processing() {

      Step(
        function () {
          FBPagePhoto.init(this);
        },
        function () {
          FBPagePhoto.get('PROCESSED', this);
        },
        function (rows) {
          // only process first row
          // console.log(rows.length);
          if (rows.length > 0) {
            var row = rows[0];
            var url = row.src;

            sockets.forEach(function (socket) {
              // var data = '';
              // for (var i=0; i < trgCount; i++) {
              //   var fileUrl = processUrl + row.object_id + '_' + row.width + 'x' + row.height + '_' + (i+100).toString().substring(1) + url.substr(url.lastIndexOf("."));
              //   data += fileUrl + '\n';
              // }
              var data = processUrl + row.object_id + '_' + row.width + 'x' + row.height + '_' + (Math.floor(Math.random()*5)+100).toString().substring(1) + url.substr(url.lastIndexOf(".")) + '\n';

              socket.write(data, function () {
                FBPagePhoto.set('NOTIFIED', row.object_id, function () {});
              });
            });
          }
        }
      );
    }

    function run() {
      // console.log("run");
      il.run();
      bRunning = true;
    }

    function stop() {
      // console.log("stop");
      il.stop();
      bRunning = false;
    }

    function isRunning() {
      return bRunning;
    }

    return {
      init: init,
      run: run,
      stop: stop,
      isRunning: isRunning
    }

  })();

  module.exports = SocketIL;
})();