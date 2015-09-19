# DevpostFeed

An electron menubar app for your Devpost notification feed

[DEMO VIDEO](https://youtu.be/HDJnJXE7jcI)

## Wut?

[@niuage](http://devpost.com/niuage) created an awesome [notification feed](http://devpost.com/software/devpost-notification-center) for likes, comments, and follows, but I don't like logging in to see it. So I thought to my self, wouldn't it be cool to make a little menubar app to show me my notifications? Sounds like a great [Electron / LevelUp2](http://levelup2.devpost.com) project.

After a little prodding, Robin showed me that there was [json feed for notifications](http://devpost.com/notifications.json?limit=30)&mdash;which is web accessible, provided you're authenticated. That meant I just had to automate a Devpost login ([which I've done before](http://devpost.com/software/cpupdate)), grab the json, process it into some pretty HTML, and display it in an Electron app. Easy peasy, right? Wrong.

## How

### The app

First, I cloned Max Ogden's [menubar](https://github.com/maxogden/menubar) app. This is an electron 'tray' app. Whenever you click on the icon in your menubar, it pops up a little Electron browser window. So if you give it an HTML file, it'll display that file every time you open the app. Great for dashboards or&mdash;_gasp_&mdash;feeds!

![http://i.imgur.com/9Twbv3r.png](http://i.imgur.com/9Twbv3r.png)

### The data

Next, I dug out my old [CPUpdate code](https://github.com/nealrs/cpupdate/blob/master/CPupdate.js). it was already written in node and used Zombie.js to login & scrape Devpost.
Once I had updated node, npm, and everything else, I was able to login, pull my feed JSON, stringify it, parse it, template out the feed HTML, convert it to a base64 data URI and _finally_ populate the window. (Whew)

![http://i.imgur.com/GjJhcjW.gif](http://i.imgur.com/GjJhcjW.gif)


## Use it

1. Clone the repo

	```
	git clone https://github.com/nealrs/DevpostFeed.git
	````

2. Install all the modules

	```
	npm install --save-dev
	```

3. Edit `config_SAMPLE.json`
	- Rename to `config.json`
	- Add your Name, login, and password (sorry folks who signed up with twitter, github, or facebook!)
	- Save

4. Start the app in development mode

	```
	npm start
	```

5. Wait for the window to popup!

6. Enjoy.

## Blergs & frustrations

1. I didn't realize that I was using an old version of node and the newest version of Zombie requires io.js or Node 4. I lost a few hours figuring that one out. The latest version of Zombie has all these functions and syntax changes that kept throwing errors with my old version. _Argh!_

2. I'm pretty crap at JavaScript, double so for node. `npm install`, `npm build`, and `npm start` are all pretty new to me, so it took me a long time to get comfortable with the flow. Also, gulp&mdash;what's that all about?

3. At some point it dawned on me that while I was receiving JSON from Robin's feed, I wasn't stringigying it or parsing it before trying to iterate over it.  *Facepalm* to the max.

4. The Menubar repo is freaking _awesome_. It lets you get a menubar app up and running in approximately 5 minutes. By default, it's not setup for dynamically generated HTML, but if you convert your HTML to a base64 encoded data URI, you can make it work. It took some experimentation, but a couple friendly folks @ GitHub pointed me in the right direction.

5. Perhaps obviously, @niuage's feed is designed to work on Devpost and Devpost alone. So, a lot of avatar URLs, are listed as `//foo.bar/avatar.png` and omit the `http:`. A little substring searching & appending fixed that.

6. I didn't get a chance to incorporate desktop notifications / reloads / a waiting screen / etc. That's all todo (if ever).

7. My node environment at work is totally fubar'd, so I had to do all this at home on my aging MBA.
