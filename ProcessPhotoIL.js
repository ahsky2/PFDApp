(function() {
  var ProcessPhotoIL = (function() {
    var IL = require('infinite-loop'),
        Step = require('step'),
        fs = require('fs'),
        path = require('path'),
        request = require('request'),
        execFile = require('child_process').execFile,
        config = require('./config'),
        FBPagePhoto = require('./FBPagePhoto');

    var il,
        bRunning = false,
        downloadPath = path.join(__dirname, 'download'),
        processPath = path.join(__dirname, 'process'),
        child,
        trgCount = config.process.count;

    function init() {
      il = new IL();

      il.onError(function (err) {
        console.log(err);;
      });

      il.setInterval(10*1000);

      il.add(imProcess);
    }

    function imProcess() {

      setImmediate(function(){
        // console.log("IL pause");
        stop();
      });

      Step(
        function () {
          FBPagePhoto.init(this);
        },
        function () {
          FBPagePhoto.get('DOWNLOADED', this);
        },
        function (rows) {
          // only process first row
          // console.log(rows.length);
          if (rows.length > 0) {
            var row = rows[0];
            var url = row.src;
            var fileName = row.object_id + '_' + row.width + 'x' + row.height +  url.substr(url.lastIndexOf("."));

            child = execFile(
              'process.py', 
              [path.join(downloadPath, fileName), path.join(processPath, fileName), trgCount], 
              {
                encoding: 'utf8',
                timeout: 0,
                maxBuffer: 200*1024,
                killSignal: 'SIGTERM',
                cwd: path.join(__dirname),
                env: {"PATH":"."}
              },
              function (err, stdout, stderr) {
                var status;

                console.log('stdout: ' + stdout);
                // console.log('stderr: ' + stderr);

                if (err !== null) {
                  console.log('exec error: ' + err);
                  status = 'ERROR_PROCESSED';
                } else {
                  status = 'PROCESSED';
                }
                
                FBPagePhoto.set(status, row.object_id, function () {
                  setImmediate(function(){
                    // console.log("IL resume");
                    run();
                  });
                });
              }
            );
          } else {
              setImmediate(function(){
                // console.log("IL resume");
                run();
              })
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

  module.exports = ProcessPhotoIL;
})();