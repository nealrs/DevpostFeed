/* DEM IMPORTS THO! */
var menubar = require('menubar');
var browser = require("zombie");
var assert = require("assert");
var fs = require('fs');
var datauri = require('datauri');
var moment = require('moment-timezone');

/* CONFIG VARS */
var loginURL = 'https://secure.devpost.com/users/login/';
var feedURL = 'http://devpost.com/notifications.json?limit=50';
var feedURI = new datauri();
var feedHTML;

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

/* SCRAPER STUFF */
// launch browser & get down to business
b = new browser();
b.visit(loginURL, function () {
  b.
    fill("user[email]", user).
    fill("user[password]", pass).
    pressButton("commit", function() {
      assert.ok(b.success);
      console.log(">> Log in OK");
      b.fetch(feedURL).then(function(response) {
        console.log('>> Feed OK');
        if (response.status === 200)
          return response.json();
        })
        .then(function(text) {
          // general feed HTML & convert to dataURI
          var json = JSON.stringify(text.notifications, null, 2);
          feedHTML = feed2html( JSON.parse(json));
          console.log('>> HTML created');
          //console.log(feedHTML);
          //console.log( mb.getOption('index') );
          mb.setOption('index', feedHTML);
          console.log('>> READY');
          mb.showWindow();
          //console.log( mb.getOption('index') );

        })
        .catch(function(error) {
          console.log('js / network error');
        });
    });
});


/* MENU BAR STUFF */
var mb = menubar({
  'width' : 350,
  'height' : 400,
  'index' : feedHTML
});


mb.once('show', function () {
  mb.window.openDevTools();
});


mb.on('ready', function ready () {
  console.log('>> Wait');
});

/* ITERATE OVER JSON & CREATE HTML PAYLOAD */
function feed2html (arr) {
  var data = "<html><head><style>body{color:#575553; margin:0;} a{color:#003e54; text-decoration:none;} img{padding-right:5px;} .header{width:100%; background-color:#003e54; color:#7FDBFF; padding: 10px; } .main{padding:10px;}</style></head><body><div class='header'><h3>"+name+", you're so popular!</h3></div><div class='main'>";
  // iterate over notifications
  for(var i=0;i<arr.length;i++){
      var obj = arr[i];

      //var time = moment(obj.updated_at).format('M/D h:mma');

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
      //data += "<p><a href='"+authorURL+"' target='_blank'><img src='"+authorAvatar+"' style='height:40px; border-radius:300px; vertical-align:middle;'> "+authorName+"</a> "+verb+"<a href='"+targetURL+"' target='_blank'>"+targetName+"</a>. ("+time+")</p>";
      //console.log(data);
  }

  data += "<p>Th-th-th-that's all folks!</p><p><img alt='Devpost' src='http://devpost0.assetspost.com/assets/shared/devpost_logo-646bdf6ac6663230947a952f8d354cad.svg' height ='30px'></p></div></body></html>";
  //console.log(data);

  feedURI.format('.html', data);
  //console.log(feedURI.content+'\n\n');
  //console.log('ok to open window - i think');

  return feedURI.content;
}
