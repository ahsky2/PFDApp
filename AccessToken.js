(function() {
  var AccessToken = (function() {
    // Sqlite3 DB
    var fs = require('fs'),
        path = require('path'),
        sqlite3 = require('sqlite3').verbose(),
        Step = require('step');

    var file = 'access_token.db',
        db,
        exist,
        access_token;

    // console.log(path.join(__dirname, file));
    exist = fs.existsSync(path.join(__dirname, file));
    // if (!exist) {
    //   fs.openSync(path.join(__dirname, file), 'w');
    // }

    init = function () {
      var callback_ = arguments[arguments.length - 1];
      var callback = (typeof(callback_) == 'function' ? callback_ : null);

      db = new sqlite3.Database(path.join(__dirname, file));

      if (exist) {
        // console.log(file + ' exists.');
        db.get('SELECT data FROM access_token', function (err, row) {
          if (err) throw err;
          // console.log(row);
          access_token = row.data;
          callback();
        });
      } else {
        console.log('Creating DB file.');
          // fs.openSync(path.join(__dirname, file), "w");

        db.serialize(function() {
          db.run('CREATE TABLE access_token (data TEXT)');
          db.run('INSERT INTO access_token (data) VALUES (?)', null);
          db.get('SELECT data FROM access_token', function (err, row) {
            if (err) throw err;
            // console.log(row);
            access_token = row.data;
            callback();
          });
        });

        exist = fs.existsSync(path.join(__dirname, file));
      }

      db.close();
    }

    get = function () {
      return access_token;
    }

    set = function (value) {
      var callback_ = arguments[arguments.length - 1];
      var callback = (typeof(callback_) == 'function' ? callback_ : null);

      db = new sqlite3.Database(path.join(__dirname, file));

      db.serialize(function() {
        db.run('UPDATE access_token SET data = ?', value);

        db.get('SELECT data FROM access_token', function (err, row) {
          if(err) throw(err);
          access_token = row.data;
          callback();
        });
      });

      db.close();
    }

    return {
      init: init,
      get: get,
      set: set
    }

  })();

  module.exports = AccessToken;
})();