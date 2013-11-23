(function() {
  var FBPagePhotoIL = (function() {
    var IL = require('infinite-loop'),
        Step = require('step'),
        FBPagePhoto = require('./FBPagePhoto'),
        il,
        bRunning = false;

    function init() {
      il = new IL();

      il.onError(function (err) {
        console.log(err);;
      });

      il.setInterval(10*1000);

      il.add(updatePhotoDB);
    }

    function updatePhotoDB() {
      // console.log('query from facebook & insert new data to photos.db');
      Step(
        function () {
          FBPagePhoto.init(this);
        },
        function () {
          FBPagePhoto.update(this);
        // },
        // function () {
        //   FBPagePhoto.get(this);
        // },
        // function (obj) {
        //   console.log(JSON.stringify(obj, censor(obj), 2));
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

  module.exports = FBPagePhotoIL;
})();