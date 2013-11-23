
/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    config = require('./config'),
    routes = require('./routes'),
    index = require('./routes/index'),
    AccessToken = require('./AccessToken'),
    Step = require('step'),
    execFile = require('child_process').execFile,
    FB = require('fb'),
    censor = require('./censor'),
    FBPagePhotoIL = require('./FBPagePhotoIL'),
    DownloadPhotoIL = require('./DownloadPhotoIL');

FB.options({
  appId:          config.facebook.appId,
  appSecret:      config.facebook.appSecret,
  redirectUri:    config.facebook.redirectUri,
  scope:          config.facebook.scope
});

// Infinite Loop
FBPagePhotoIL.init();
DownloadPhotoIL.init();

// Sqlite3 DB
Step(
  function () {
    AccessToken.init(this);
  },
  function () {
    // console.log('access token : ' + AccessToken.get());
    if (AccessToken.get() == null) {
      console.log('you need to login with facebook.');
      child2 = execFile('open', [config.rootUrl], this);
    } else {
      console.log('you already have an access token of the facebook.');
      // console.log('acess_token : ' + AccessToken.get());
      FB.setAccessToken(AccessToken.get());

      if (!FBPagePhotoIL.isRunning()) {
        FBPagePhotoIL.run();
      }

      if (!DownloadPhotoIL.isRunning()) {
        DownloadPhotoIL.run();
      }
    }
  },
  function (error, stdout, stderr) {
    console.log(stdout);
  }
);

// Express App
var app = express();
if(!config.facebook.appId || !config.facebook.appSecret) {
    throw new Error('facebook appId and appSecret required in config.js');
}

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.cookieSession({ secret: 'secret'}));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/login/callback', index.loginCallback);
app.get('/logout', index.logout);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
