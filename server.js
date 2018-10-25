const express = require('express');
const app = express();
app.use(express.static('app'));

// Database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('vt2.db');

app.listen(3000, () => {
  console.log('server started at http://localhost:3000/');
});

// GET requests
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

/** Get the average score of the song ordered by date. */
app.get('/average/:title/:artist', (req, res) => {
  const nameToLookup = req.params.title;
  const artistToLookup = req.params.artist;
  console.log("Request name:", nameToLookup);
  console.log("Request artist:", artistToLookup);
  db.all(
    'SELECT AVG(score) as "score", date FROM score WHERE title=$song AND artist=$artist GROUP BY date',
    {
      $song: nameToLookup,
      $artist: artistToLookup
    },
    (err, rows) => {
      if (rows.length > 0) {
        console.log('GET /average: score found for song ' + artistToLookup + ' - ' + nameToLookup);
        res.send({scores: rows});
      } else {
        console.log('GET /average: No score found for any user for song ' + artistToLookup + ' - ' + nameToLookup);
        res.send({});
      }
    }
  );
});

// POST requests
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
/** Adds a song to the library; updates the lyric base if the song exists. */
app.post('/addSong/', (req, res) => {
  db.all('SELECT * FROM songs_to_lyrics WHERE title=$song AND artist=$artist AND language=$language',
    {
      $song: req.body.title,
      $artist: req.body.artist,
      $language: req.body.language
    },
    (err, rows) => {
      if (rows.length > 0) { // update
        db.run('UPDATE songs_to_lyrics SET oLyric=$oLyric, tLyric=$tLyric WHERE title=$song AND artist=$artist AND language=$language', {
          $title: req.body.title,
          $artist: req.body.artist,
          $language: req.body.language,
          $oLyric: req.body.oLyric,
          $tLyric: req.body.tLyric
        },
          (err) => {
            if (err) {
              console.log('error in POST /addSong');
              res.send({ status: false, message: 'Error in app.post(/addSong)' });
            } else {
              console.log('POST successful');
              res.send({ status: true, insert: false});
            }
          });
      } else { // insert
        db.run(
          'INSERT INTO songs_to_lyrics VALUES ($title, $artist, $language, $oLyric, $tLyric, 0)',
          {
            $title: req.body.title,
            $artist: req.body.artist,
            $language: req.body.language,
            $oLyric: req.body.oLyric,
            $tLyric: req.body.tLyric
          },
          (err) => {
            if (err) {
              console.log('error in POST');
              res.send({ status: false, message: 'Error in app.post(/addSong)' });
            } else {
              console.log('POST successful');
              res.send({ status: true, insert: true});
            }
          }
        );
      }
    }
  );
});

/** Displays the user's score for a specific song. */
app.post('/showScore', (req, res) => {
  const username = req.body.username;
  const title = req.body.title;
  const artist = req.body.artist;

  db.all(
    'SELECT score, date FROM score WHERE username=$username AND title=$title AND artist=$artist ORDER BY date',
    {
      $username: username,
      $title: title,
      $artist: artist
    },
    (err, rows) => {
      if (rows.length > 0) {
        res.send({ scores: rows });
      } else {
        console.log('Song doesn\'t exist while POSTing /showScore'); // user tries to lookup a song that doesn't exist in the db, throws error
        res.send({});
      }
    }
  );
});

/** Searches for a song based on title OR artist. */
app.post('/search', (req, res) => {
  const title = req.body.title;
  const artist = req.body.artist;
  // Front-end validation guarantees that at least one is nonempty.
  if (title === '') {
    db.all('SELECT * FROM songs_to_lyrics WHERE artist=$artist',
      {
        $artist: artist
      },
      (err, rows) => {
        if (err) {
          res.send({ status: false, message: 'Error in /POST' });
        } else if (rows.length === 0) {
          res.send({ status: false, message: 'Artist ' + artist + ' not found.' });
        } else {
          res.send({ status: true, unique: false, songs: rows });
        }
      });
  } else if (artist === '') {
    db.all('SELECT * FROM songs_to_lyrics WHERE title=$title',
    {
      $title: title
    },
    (err, rows) => {
      if (err) {
        res.send({ status: false, message: 'Error in /POST' });
      } else if (rows.length === 0) {
        res.send({ status: false, message: 'Title ' + title + ' not found.' });
      } else {
        res.send({ status: true, unique: false, songs: rows });
      }
    });
  } else {
    db.all('SELECT * FROM songs_to_lyrics WHERE artist=$artist AND title=$title',
    {
      $artist: artist,
      $title: title
    },
    (err, rows) => {
      if (err) {
        res.send({ status: false, message: 'Error in /POST' });
      } else if (rows.length === 0) {
        res.send({ status: false, message: 'Song: ' + artist + ' - ' + title + ' not found.' });
      } else {
        res.send({ status: true, unique: true, songs: rows });
      }
    });
  }
});