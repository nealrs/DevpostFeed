var menubar = require('menubar');

var mb = menubar({
  'width' : '500',
  'height' : '800',
  //'preloadWindow' : true,
  //'' : ''
});

mb.on('ready', function ready () {
  console.log('app is ready');
});
