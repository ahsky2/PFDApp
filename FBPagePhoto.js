(function() {
  var FBPagePhoto = (function() {
    var FB = require('fb'),
        Step = require('step'),
        fs = require('fs'),
        path = require('path'),
        sqlite3 = require('sqlite3').verbose(),
        config = require('./config'),
        censor = require('./censor');

    var file = 'photos.db',
        db,
        exist,
        access_token;

    // console.log(path.join(__dirname, file));
    exist = fs.existsSync(path.join(__dirname, file));
    // if (!exist) {
    //   fs.openSync(path.join(__dirname, file), 'w');
    // }

    db = new sqlite3.Database(path.join(__dirname, file));

    init = function () {
      var callback_ = arguments[arguments.length - 1];
      var callback = (typeof(callback_) == 'function' ? callback_ : null);

      if (exist) {
        // console.log(file + ' exists.');
        callback();
      } else {
        console.log('Creating DB file.');
          // fs.openSync(path.join(__dirname, file), "w");

        db.run('CREATE TABLE photos (object_id INTEGER PRIMARY KEY NOT NULL, src TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL, created INTEGER NOT NULL, modified INTEGER NOT NULL, status TEXT NOT NULL)', function (err) {
          if (err) throw err;

          callback();
        });

        exist = fs.existsSync(path.join(__dirname, file));
      }
    }

    //SELECT pid, created, modified, src_big, src_big_width, src_big_height FROM photo WHERE pid IN (select pid from photo_tag where subject in (select page_id from page where name='PFDTest'))

    update = function () {
      var callback_ = arguments[arguments.length - 1];
      var callback = (typeof(callback_) == 'function' ? callback_ : null);

      var fb_photos = [];

      Step(
        function () {
          FB.napi('fql', {
            q: "SELECT app_data.photo_ids FROM stream WHERE source_id IN (select page_id from page where name='" + config.title + "')"
          }, this);
        },
        function (err, res) {
          if (err) throw err;

          // console.log(res);

          var object_ids = [];
          for (row_id in res.data) {
            var photo_ids = res.data[row_id].app_data.photo_ids;
            for (object_id in photo_ids) {
              // console.log(JSON.stringify(photo_ids[object_id]));
              object_ids.push(photo_ids[object_id]);
            }
          }
          // console.log("SELECT object_id, created, modified, src_big, src_big_width, src_big_height FROM photo WHERE object_id IN (" + object_ids.toString() + ")");

          FB.napi('fql', {
            q: "SELECT object_id, created, modified, src_big, src_big_width, src_big_height FROM photo WHERE object_id IN (" + object_ids.toString() + ")"
          }, this);
        },
        function (err, res) {
          if (err) throw err;

          var group = this.group();
          
          fb_photos = res.data;
          for (i in fb_photos) {
            var object_id = fb_photos[i].object_id;
            db.get('SELECT count(object_id) as count FROM photos WHERE object_id = ?', object_id, group());
          }
        },
        function (err, rows) {

          var group = this.group();
          for (i in rows) {
            var count = rows[i].count;
            if(count == 0) {
              var object_id = fb_photos[i].object_id;
                  src = fb_photos[i].src_big,
                  width = fb_photos[i].src_big_width,
                  height = fb_photos[i].src_big_height,
                  created = fb_photos[i].created,
                  modified = fb_photos[i].modified;
                  status = 'INIT';
              db.run("INSERT INTO photos (object_id, src, width, height, created, modified, status) VALUES (?, ?, ?, ?, ?, ?, ?)", [
                object_id, src, width, height, created, modified, status
              ], group());
            } else {
              return group();
            }
          }
        },
        function (err) {
          if (err) throw err;

          // console.log('A photo data insert.');

          callback();
        }
      );
    }


    get = function () {
      var callback_ = arguments[arguments.length - 1];
      var callback = (typeof(callback_) == 'function' ? callback_ : null);

      if (arguments.length == 2 && typeof(arguments[0]) == 'string') {
        var status = arguments[0];
        Step(
          function () {
            db.all("SELECT object_id, src, width, height, created, modified, status FROM photos WHERE status = ?", status, this);
          },
          function (err, rows) {
            callback(rows);
          }
        );
      } else {
        Step(
          function () {
            db.all("SELECT object_id, src, width, height, created, modified, status FROM photos", this);
          },
          function (err, rows) {
            callback(rows);
          }
        );
      }
    }

    set = function () {
      var callback_ = arguments[arguments.length - 1];
      var callback = (typeof(callback_) == 'function' ? callback_ : null);

      if (arguments.length == 3 && typeof(arguments[0]) == 'string' && typeof(arguments[1]) == 'number') {
        var status = arguments[0];
        var object_id = arguments[1];

        db.run('UPDATE photos SET status = ? WHERE object_id = ?', [status, object_id], function (err) {
          if (err) throw err;
          callback();
        });
      }
    }

    post = function (post_id) {
      var callback_ = arguments[arguments.length - 1];
      var callback = (typeof(callback_) == 'function' ? callback_ : null);

      var fb_photos = [];

      Step(
        function () {
          FB.napi('fql', {
            q: "SELECT app_data.photo_ids FROM stream WHERE post_id = '" + post_id + "'"
          }, this);
        },
        function (err, res) {
          if (err) throw err;

          var object_ids = [];
          for (row_id in res.data) {
            var photo_ids = res.data[row_id].app_data.photo_ids;
            for (object_id in photo_ids) {
              // console.log(JSON.stringify(photo_ids[object_id]));
              object_ids.push(photo_ids[object_id]);
            }
          }
          // console.log("SELECT object_id, created, modified, src_big, src_big_width, src_big_height FROM photo WHERE object_id IN (" + object_ids.toString() + ")");

          FB.napi('fql', {
            q: "SELECT object_id, created, modified, src_big, src_big_width, src_big_height FROM photo WHERE object_id IN (" + object_ids.toString() + ")"
          }, this);
        },
        function (err, res) {
          if (err) throw err;

          var group = this.group();
          
          fb_photos = res.data;
          for (i in fb_photos) {
            var object_id = fb_photos[i].object_id;
            db.get('SELECT count(object_id) as count FROM photos WHERE object_id = ?', object_id, group());
          }
        },
        function (err, rows) {

          var group = this.group();
          for (i in rows) {
            var count = rows[i].count;
            if(count == 0) {
              var object_id = fb_photos[i].object_id;
                  src = fb_photos[i].src_big,
                  width = fb_photos[i].src_big_width,
                  height = fb_photos[i].src_big_height,
                  created = fb_photos[i].created,
                  modified = fb_photos[i].modified;
                  status = 'POSTED';
              db.run("INSERT INTO photos (object_id, src, width, height, created, modified, status) VALUES (?, ?, ?, ?, ?, ?, ?)", [
                object_id, src, width, height, created, modified, status
              ], group());
            } else {
              return group();
            }
          }
        },
        function (err) {
          if (err) throw err;

          // console.log('A photo data insert.');

          callback();
        }
      );
    }

    return {
      init: init,
      update: update,
      get: get,
      set: set,
      post: post
    }

  })();

  module.exports = FBPagePhoto;
})();