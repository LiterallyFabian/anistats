const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const graphqlUrl = 'https://graphql.anilist.co';
const fs = require('fs');
let cache = {};

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        footer: fs.readFileSync('./views/footer.ejs', 'utf8'),
        title: 'Anistats',
    });
});

router.get('/about', function (req, res, next) {
    res.render('about', {
        footer: fs.readFileSync('./views/footer.ejs', 'utf8'),
        title: 'Anistats',
    });
});

router.get('/stats/:username', function (req, res) {
    let username = req.params.username;
    if (username.includes("https://anilist.co/user/"))
        username = username.split("https://anilist.co/user/")[1].split("/")[0];

    // Check for cached data
    if (cache[username]) {
        if (cache[username].time + 60 * 60 * 1000 > Date.now()) {
            // Return cached data if it's less than an hour old
            console.log(`Returning cached data for ${username}`);
            return res.render('stats', {
                footer: fs.readFileSync('./views/footer.ejs', 'utf8'),
                title: 'Anistats',
                data: cache[username].data.data,
            });
        }
    }

    // language=GraphQL
    let query = `query ($username: String, $type: MediaType) {
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
                                medium
                                large
                            }
                            title{
                                romaji
                                english
                            }
                        }
                    }
                }
            }
        }
        MediaListCollection(userName: $username, type: $type) {
            lists {
                name
                isCustomList
                isCompletedList: isSplitCompletedList
                entries {
                    ...mediaListEntry
                }
            }
        }
    }
    fragment mediaListEntry on MediaList {
        mediaId
        status
        score
        progress
        progressVolumes
        notes
        updatedAt
        startedAt {
            year
            month
            day
        }
        completedAt {
            year
            month
            day
        }
        media {
            id
            title {
                userPreferred
                romaji
                english
            }
            coverImage {
                extraLarge
                large
            }
            type
            format
            status(version: 2)
            episodes
            averageScore
            popularity
            isAdult
            countryOfOrigin
            genres
            bannerImage
            startDate {
                year
                month
                day
            }
        }
    }
    `

    let variables = {
        username: username,
        type: 'ANIME'
    }


    console.log(`Fetching new stats for ${username}.`);
    try {
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

            if (data.errors) {
                console.log(data.errors);
                return res.render('error', {
                    footer: fs.readFileSync('./views/footer.ejs', 'utf8'),
                    title: 'Anistats',
                    data: data.errors[0]
                });
            }

            // Cache data
            cache[username] = {
                time: Date.now(),
                data: data
            }

            console.log(data)
            return res.render('stats', {
                footer: fs.readFileSync('./views/footer.ejs', 'utf8'),
                title: 'Anistats', data: cache[username].data.data
            });
        });
    } catch (e) {
        console.log(e);
        return res.render('error', {
            footer: fs.readFileSync('./views/footer.ejs', 'utf8'),
            title: 'Anistats',
            data: {
                message: "An error occurred while fetching data.",
                status: 500,
            }
        });
    }
});

module.exports = router;
