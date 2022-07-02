const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const graphqlUrl = 'https://graphql.anilist.co';
let cache = {};

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Anistats'});
});

router.post('/stats', function (req, res) {
    let username = req.body.username;
    if (username.includes("https://anilist.co/user/"))
        username = username.split("https://anilist.co/user/")[1].split("/")[0];

    // Check for cached data
    if (cache[username]) {
        if (cache[username].time + 60 * 60 * 1000 > Date.now()) {
            // Return cached data if it's less than an hour old
            console.log(`Returning cached data for ${username}`);
            return res.render('stats', {title: 'Anistats', data: cache[username].data.data});
        }
    }

    // language=GraphQL
    let query = `query ($username: String) {
        User(name: $username) {
            id
            name
            avatar {
                medium
            }
            createdAt
            mediaListOptions {
                scoreFormat
            }
            bannerImage
            statistics {
                anime {
                    count
                    meanScore
                    minutesWatched
                    episodesWatched
                    genrePreview: genres(sort: COUNT_DESC){
                        genre
                        count
                        meanScore
                    }
                }
            }
            favourites{
                anime{
                    edges {
                        node{
                            id
                            type
                            isAdult
                            bannerImage
                            coverImage {
                                large
                            }
                            title{
                                english
                            }
                        }
                    }
                }
            }
        }
    }
    `

    let variables = {
        username: username
    }


    console.log(`Fetching new stats for ${username}.`);
    fetch(graphqlUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
                query: query,
                variables: variables
            }
        )
    }).then(r => r.json()).then(data => {
        // Cache data
        cache[username] = {
            time: Date.now(),
            data: data
        }

        console.log(data)
        return res.render('stats', {title: 'Anistats', data: cache[username].data.data});
    });
});

module.exports = router;
