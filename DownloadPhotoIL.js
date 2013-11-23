(function() {
  var DownloadPhotoIL = (function() {
    var IL = require('infinite-loop'),
        Step = require('step'),
        fs = require('fs'),
        path = require('path'),
        request = require('request'),
        FBPagePhoto = require('./FBPagePhoto');

    var il,
        bRunning = false,
        dowloadPath = path.join(__dirname, 'download');

    function init() {
      il = new IL();

      il.onError(function (err) {
        console.log(err);;
      });

      il.setInterval(10*1000);

      il.add(download);
    }

    function download() {
      Step(
        function () {
          FBPagePhoto.init(this);
        },
        function () {
          FBPagePhoto.get('INIT', this);
        },
        function (rows) {

          var group = this.group;

          rows.forEach(function (row) {
            var url = row.src;
            var fileName = row.object_id + '_' + row.width + 'x' + row.height +  url.substr(url.lastIndexOf("."));

            var writeStream = fs.createWriteStream(path.join(dowloadPath, fileName));
            writeStream.on('finish', function () {
              console.log(row.object_id);
              FBPagePhoto.set('DOWNLOADED', row.object_id, group());
            });

            request(url).pipe(writeStream);
          });
          // console.log(JSON.stringify(obj, null, 2));
        }
      );
    }

    function run() {
      il.run();
      bRunning = true;
    }

    function stop() {
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

  module.exports = DownloadPhotoIL;
})();