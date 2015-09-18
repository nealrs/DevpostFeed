var menubar = require('menubar');
var browser = require("zombie");
var assert = require("assert");
var fs = require('fs');

// PARAMS & VARS
var loginURL = 'https://secure.devpost.com/users/login/';
var feedURL = 'http://devpost.com/notifications.json?limit=30';


// get login params from config file.
var name, user, pass;
var readConfig = fs.readFileSync('./config.json');
var config;
try {
  config = JSON.parse(readConfig);
  //console.log(config);
  name = config.name;
  user = config.user;
  pass = config.pass;
}
catch (err) {
  console.log('There has been an error parsing your JSON.');
  console.log(err);
}

/* ------------------------------ */

/* SCRAPER STUFF */
// launch browser & get down to business
const b = new browser();

// Login & go to edit software form
b.visit(loginURL, function () {
  b.
    fill("user[email]", user).
    fill("user[password]", pass).
    pressButton("commit", function() {
      assert.ok(b.success);
      console.log(">> Logged in as "+user);
      b.fetch(feedURL).then(function(response) {
        console.log('Status code:', response.status);
        if (response.status === 200)
          return response.json();
        })
        .then(function(text) {
          var feed = text;
          var feedJSON = JSON.stringify(text.notifications, null, 2);

          // write feed HTML to local file
          fs.writeFile('feed.html', feed2html( JSON.parse(feedJSON) ), function (err) {
            if (err) return console.log(err);
            console.log('wrote new feed to index.html');
          });
          //b.close();
        })
        .catch(function(error) {
          console.log('Network error');
        });
    });
});


/* MENU BAR STUFF */
var mb = menubar({
  'width' : 350,
  'height' : 400,
  'index' : 'file:///Users/neal/Desktop/feed/feed.html'
});

/*
mb.once('show', function () {
  mb.window.openDevTools();
});
*/

mb.on('ready', function ready () {
  console.log('app is ready');
  /*fs.writeFile('index.html', feed, function (err) {
    if (err) return console.log(err);
    console.log('wrote new feed to index.html');
  });*/

  //var x = mb.getOption('index');
  //console.log(x);
  //mb.setOption('index', 'file:///Users/neal/Desktop/feed/feed.html');
});


function feed2html (arr) {
  var data = "<html><head><style>body{padding:10px; color:#575553;} a{color:#003e54; text-decoration:none;} img{padding-right:5px;}</style></head><body><h3>"+name+", you're so popular!</h3>";
  // iterate over notifications
  for(var i=0;i<arr.length;i++){
      var obj = arr[i];

      var authorURL = obj.author.url;
      var authorName = obj.author.display_name;
      var authorAvatar = obj.author.avatar_url;

      if (authorAvatar.substring(0, 2) == '//'){
        authorAvatar = "http:" + authorAvatar;
      }

      var verb;
      switch (obj.verb) {
        case 'user followed':
          verb = "followed you";
          break;

        case 'software liked':
          verb = "liked ";
          break;

        case 'update commented on':
          verb = "commented on ";
          break;

        default:
          verb = "???";
        }

      var targetName = '';
      var targetURL;
      var targetPic;
      if (obj.target){
        targetName = obj.target.name;
        targetURL = obj.target.url;
        targetPic = obj.target.thumbnail_url;
      }

      data += "<p><a href='"+authorURL+"' target='_blank'><img src='"+authorAvatar+"' style='height:40px; border-radius:300px; vertical-align:middle;'> "+authorName+"</a> "+verb+"<a href='"+targetURL+"' target='_blank'>"+targetName+"</a>.</p>";
      //console.log(data);
  }

  data += "<p>Th-th-th-that's all folks!</p><p><img alt='Devpost' src='http://devpost0.assetspost.com/assets/shared/devpost_logo-646bdf6ac6663230947a952f8d354cad.svg' height ='30px'></p></body></html>";
  console.log(data);
  return data;
}
