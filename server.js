const express = require('express');
const app = express();
app.use(express.static('vt2-stats'));

// Database
const sqlite3 = require('sqlite3').verbose();
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

function checkIfNameExists(name) {
  var stmt = db.prepare('SELECT COUNT(*) AS "count" FROM player WHERE name=?');
  var tst = stmt.get(name);
  console.log(tst);
  
  stmt.finalize();
}

// POST requests
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
/* Add a game to the database. */
app.post('/addGame/', function(req, res) {
  db.serialize(function() {
    db.get('SELECT COUNT(*) AS "count" FROM game', function(err, row) {
      const curGameID = row.count + 1;
      var stmt = db.prepare('INSERT INTO game VALUES (?, ?, ?, ?)')
      stmt.run(curGameID, req.body.difficulty, req.body.map, req.body.didWin);
      stmt.finalize();
      
      // Inserting all player info into (player) and (played_in)
      for (var i = 0, k = 0; i < 4; ++i) {
        db.serialize(function() {
          checkIfNameExists(req.body.players[k].name);
          stmt = db.prepare('SELECT * FROM player WHERE name=?');
          stmt.get(req.body.players[k].name, function(err, row) {
            // if the player is not in the player table yet, add them
            if (!row) {
              stmt = db.prepare('INSERT INTO player VALUES (?, NULL)');
              stmt.run(req.body.players[k].name);
            }
            k++;
          });
          
          console.log('inserting into played_in');
          stmt = db.prepare('INSERT INTO played_in VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
          stmt.run(
            req.body.players[i].name,
            curGameID,
            req.body.players[i].character,
            req.body.players[i].class,
            req.body.players[i].kills,
            req.body.players[i].specials,
            req.body.players[i].ranged,
            req.body.players[i].melee,
            req.body.players[i].damageDealt,
            req.body.players[i].damageMonsters,
            req.body.players[i].damageTaken,
            req.body.players[i].hs,
            req.body.players[i].saves,
            req.body.players[i].revives,
            req.body.players[i].ff
          );
        });
      };
      stmt.finalize();
      
      res.send({ status: true, message: 'POST SUCCESS' });
    });
  });
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