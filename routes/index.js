var FB = require('fb'),
    Step = require('step'),
    config = require('../config'),
    censor = require('../censor'),
    AccessToken = require('../AccessToken'),
    FBPagePhotoIL = require('../FBPagePhotoIL'),
    DownloadPhotoIL = require('../DownloadPhotoIL');

/*
 * GET home page.
 */

exports.index = function(req, res){
  var accessToken = req.session.access_token;
  if(!accessToken) {
    res.render('index', {
      hasAccessToken: false,
      title: config.title,
      page: 'Facebook login',
      link: FB.getLoginUrl(),
      button: '/images/login.png'
    });
  } else {
    var obj = {};
    obj.session = req.session;

    Step(
      function () {
        AccessToken.init(this);
      },
      function () {
        if (accessToken != AccessToken.get()) {
          AccessToken.set(accessToken, this);
        } else {
          return this;
        }
      },
      function () {
        // console.log('access token : ' + AccessToken.get());
        FB.setAccessToken(AccessToken.get());

        if (!FBPagePhotoIL.isRunning()) {
          FBPagePhotoIL.run();
        }
        
        if (!DownloadPhotoIL.isRunning()) {
          DownloadPhotoIL.run();
        }

        FB.napi('/me', this);
      },
      function (err, me) {
        if(err) throw err;
        // console.log(me);
        obj.me = me;

        res.render('index', {
          hasAccessToken: true,
          text: JSON.stringify(obj, censor(obj), 2),
          title: config.title,
          page: 'Facebook logout',
          link: '/logout',
          button: '/images/logout.png'
        });
      }
    );
  }
};

exports.loginCallback = function (req, res, next) {
  var code            = req.query.code;
  // console.log(JSON.stringify(req.query, censor(req.query), 2));

  if(req.query.error) {
    // user might have disallowed the app
    return res.send('login-error ' + req.query.error_description);
  } else if(!code) {
    return res.redirect('/');
  }

  Step(
    function exchangeCodeForAccessToken() {
      FB.napi('oauth/access_token', {
        client_id:      FB.options('appId'),
        client_secret:  FB.options('appSecret'),
        redirect_uri:   FB.options('redirectUri'),
        code:           code
      }, this);
    },
    function extendAccessToken(err, result) {
      if(err) throw(err);

      FB.napi('oauth/access_token', {
        client_id:          FB.options('appId'),
        client_secret:      FB.options('appSecret'),
        grant_type:         'fb_exchange_token',
        fb_exchange_token:  result.access_token
      }, this);
    },
    function saveSession(err, result) {
      if(err) return next(err);

      req.session.access_token    = result.access_token;
      req.session.expires         = result.expires || 0;
      req.session.cookie.maxAge = parseInt(result.expires)*1000;

      return res.redirect('/');
    }
  );
};

exports.logout = function (req, res) {
    req.session = null; // clear session
    res.redirect('/');
};