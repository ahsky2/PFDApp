(function() {
  var ProcessPhotoIL = (function() {
    var IL = require('infinite-loop'),
        Step = require('step'),
        fs = require('fs'),
        path = require('path'),
        FB = require('fb'),
        request = require('request'),
        https = require('https'),//Https module of Node.js
        fs = require('fs'), //FileSystem module of Node.js
        FormData = require('form-data'), //Pretty multipart form maker.
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
                  FBPagePhoto.set(status, row.object_id, function () {
                    setImmediate(function(){
                      // console.log("IL resume");
                      run();
                    });
                  });
                } else {
                  status = 'PROCESSED';
                  FBPagePhoto.set(status, row.object_id, function () {
                    setImmediate(function(){
                      // console.log("IL resume");
                      run();
                    });
                  });

                  // post
                   
                  var ACCESS_TOKEN = FB.getAccessToken();
                  var upload_file = path.join(
                    processPath, 
                    row.object_id + '_' + row.width + 'x' + row.height + '_' + (Math.floor(Math.random()*5)+100).toString().substring(1) + url.substr(url.lastIndexOf("."))
                  );
                  // console.log(upload_file);
                  var form = new FormData(); //Create multipart form
                  form.append('source', fs.createReadStream(upload_file)); //Put file
                  form.append('message', "PFD post"); //Put message
                   
                  //POST request options, notice 'path' has access_token parameter
                  var options = {
                      method: 'post',
                      host: 'graph.facebook.com',
                      path: '/757848304240284/photos?access_token='+ACCESS_TOKEN,
                      headers: form.getHeaders(),
                  }
                   
                  //Do POST request, callback for response
                  var request = https.request(options, function (res){
                    // console.log(res);
                    var response = '';
                    res.setEncoding('utf8');
                    res.on('data', function (data) {
                      // console.log(data);
                      response += data;
                    });

                    // This never happens
                    res.on('end', function(){
                        // console.log("End received!");
                        var post_id = JSON.parse(response).post_id;
                        // console.log(JSON.parse(response).poset);
                        FBPagePhoto.post(post_id, function () {});
                    });

                    // But this does
                    res.on('close', function(){
                        // console.log("Close received!");
                    });
                  });
                   
                  //Binds form to request
                  form.pipe(request);
                   
                  //If anything goes wrong (request-wise not FB)
                  request.on('error', function (error) {
                       console.log(error);
                  });
                }
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