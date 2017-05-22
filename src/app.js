'use strict';

// Set up Express, Twit and config file
const config = require('./config.js');
const express = require('express');
const Twit = require('twit');

const T = new Twit(config);
const app = express();

app.use(express.static(__dirname + '/public'));

// pug template engine
app.set('view engine', 'pug');
// template directory
app.set('views', __dirname + '/templates');

app.locals.basedir = '/';

app.get('/', (req, res) => {

    const profileRequest = T.get('account/verify_credentials', (err, data, response) => {
    });

    const tweetsRequest = T.get('statuses/user_timeline', { screen_name: 'alborzmesbahi', count: 5 }, (err, data, response) => {
    });

    const friendsRequest = T.get('friends/list', { screen_name: 'alborzmesbahi', count: 5 }, (err, data, response) => {
    });

    const messagesRequest = T.get('direct_messages/sent', { screen_name: 'alborzmesbahi', count: 5 }, (err, data, response) => {
    });

    const promiseArray = [profileRequest, tweetsRequest, friendsRequest, messagesRequest];

    Promise.all(promiseArray).then((promisesResolvedArray) => {
         //console.log(promisesResolvedArray[0]);
        // profileRequest data
        let myScreenName = promisesResolvedArray[0].data.screen_name;
        let myProfileImageUrl = promisesResolvedArray[0].data.profile_image_url_https;
        let name = promisesResolvedArray[0].data.name;

        // tweetsRequest data
        let tweets = promisesResolvedArray[1].data // do a loop here?
        let tweetsArray = [];
        tweets.forEach((currentValue, index, array) => {
            //console.log(currentValue);
            //console.log(currentValue.retweet_count);
            tweetsArray.push({ 
                text: currentValue.text,
                retweetCount: currentValue.retweet_count,
                favoriteCount: currentValue.favorite_count,
                createdAt: currentValue.created_at
            });
            //console.log(tweetsArray);
        });
        //console.log(tweetsArray);
        //console.log(tweets);

        // friendsRequest data
        let friends = promisesResolvedArray[2].data.users
        //console.log(friends);
        let friendsArray = [];
        friends.forEach((currentValue, index, array) => {
            //console.log(currentValue);
            //console.log(currentValue.profile_image_url_https);
            //console.log(currentValue.name);
            //console.log(currentValue.screen_name);
            friendsArray.push({
                profile_image_url_https: currentValue.profile_image_url_https,
                name: currentValue.name,
                screen_name: currentValue.screen_name
            });
            //console.log(friendsArray);
        });

        // messagesRequest data
        let messages = promisesResolvedArray[3].data;
        //console.log(messages);
        let messagesArray = [];
        messages.forEach((currentValue, index, array) => {
            //console.log(currentValue);
            //console.log(currentValue.text);
            //console.log(currentValue.sender.created_at);
            messagesArray.push({
                text: currentValue.text,
                dateSent: currentValue.sender.created_at, /* parse? */
                timeSent: currentValue.sender.created_at, /* parse? */
                recipient: currentValue.recipient.name
            });
            //console.log(messagesArray);
        });

        res.render('index', {
            myScreenName: myScreenName,
            myProfileImageUrl: myProfileImageUrl,
            name: name,
            friendsArray: friendsArray,
            tweetsArray: tweetsArray,
            messagesArray: messagesArray
        });
    }).catch((err) => {
        console.log(err);
    });
});

// Web server on port 3000
app.listen(3000, () => {
    console.log(`Frontend server running on port 3000`);
});