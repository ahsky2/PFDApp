
var config = { };

config.title = 'Project Face Drawing Test';

// should end in /
config.rootUrl  = 'http://localhost:3000/';

config.facebook = {
    appId: '130243393813697',
    appSecret: 'c82696768ae4ad8b63db874cb64eb558',
    appNamespace: 'nodescrumptious',
    redirectUri: config.rootUrl + 'login/callback',
    scope: [
      'user_about_me',
      'manage_pages', 
      'publish_stream',
      'photo_upload',
      'user_photos', 
      'friends_photos', 
      'user_photo_video_tags', 
      'friends_photo_video_tags'
    ]
};

config.process = {
  url: config.rootUrl + 'process/',
  port: 4000,
  count: 5
};

module.exports = config;
