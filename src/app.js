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

// function to parse the Twitter date
const parseTwitterDate = (dateString) => {
    let date = new Date(
        dateString.replace(/^\w+ (\w+) (\d+) ([\d:]+) \+0000 (\d+)$/,
            "$1 $2 $4 $3 UTC"));
    return date;
}

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
        // profileRequest data
        let myScreenName = promisesResolvedArray[0].data.screen_name;
        let myProfileImageUrl = promisesResolvedArray[0].data.profile_image_url_https;
        let name = promisesResolvedArray[0].data.name;
        let followersCount = promisesResolvedArray[0].data.followers_count;

        // tweetsRequest data
        let tweets = promisesResolvedArray[1].data // do a loop here?
        let tweetsArray = [];
        tweets.forEach((currentValue, index, array) => {
            let createdAtDate = parseTwitterDate(currentValue.created_at);
            tweetsArray.push({
                text: currentValue.text,
                retweetCount: currentValue.retweet_count,
                favoriteCount: currentValue.favorite_count,
                createdAt: createdAtDate.toUTCString()
            });
        });

        // friendsRequest data
        let friends = promisesResolvedArray[2].data.users
        let friendsArray = [];
        friends.forEach((currentValue, index, array) => {
            friendsArray.push({
                profile_image_url_https: currentValue.profile_image_url_https,
                name: currentValue.name,
                screen_name: currentValue.screen_name
            });
        });

        // messagesRequest data
        let messages = promisesResolvedArray[3].data;
        let messagesArray = [];
        messages.forEach((currentValue, index, array) => {
            let createdAtDate = parseTwitterDate(currentValue.created_at);
            messagesArray.push({
                text: currentValue.text,
                dateSent: createdAtDate.toUTCString(),
                recipient: currentValue.recipient.name
            });
        });

        res.render('index', {
            myScreenName: myScreenName,
            myProfileImageUrl: myProfileImageUrl,
            name: name,
            followersCount: followersCount,
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
