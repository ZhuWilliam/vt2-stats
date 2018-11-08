const express = require('express');
const app = express();
app.use(express.static('vt2-stats'));

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
/* Add a game to the database. */
app.post('/addGame/', function(req, res) {
  db.get('SELECT COUNT(*) AS "count" FROM game', function(err, row) {
    const curGameID = row.count + 1;
    
    db.run(
      'INSERT INTO game VALUES ($curGameID, $difficulty, $map, $didWin)',
      {
        $curGameID: curGameID,
        $difficulty: req.body.difficulty,
        $map: req.body.map,
        $didWin: req.body.didWin
      },
      function(err) {
        if (err) {
          console.log('Error in app.post(/addGame/) on INSERTING game: ' + err);
        }
      }
    );
    
    // Inserting all player info into (player) and (played_in)
    for (var i = 0; i < 4; ++i) {
      console.log("------ i: " + i);
      
      /*db.get(
        'SELECT COUNT(*) AS "count" FROM player WHERE name = $name',
        {
          $name: req.body.players[i].name
        },
        function(err, row) {
          // if the player is not in the player table yet, add them
          console.log("DID WE MAKE IT< CAPTAIN");
          console.log(row);
          if (row.cnt === 0) {
            console.log("--------------- i: " + i);
            */
            db.run(
              'INSERT INTO player VALUES ($name, NULL)',
              {
                $name: req.body.players[i].name
              },
              function(err) {
                if (err) {
                  console.log('Error in app.post(/addGame) on INSERTING player: ' + err);
                  console.log('attempted to insert: ' +  req.body.players[i].name)
                }
                else {
                  console.log("INSERT TO player SUCCESS")
                }
              }
            );
          /*}
        }
      );*/
      
      console.log("inserting into played_in")
      db.run(
        'INSERT INTO played_in VALUES ($name, $curGameID, $character, $class, $kills, $specials, $ranged, $melee, $damageDealt, $damageMonsters, $damageTaken, $hs, $saves, $revives, $ff)',
        {
          $name: req.body.players[i].name,
          $curGameID: curGameID,
          $character: req.body.players[i].character,
          $class: req.body.players[i].class,
          $kills: req.body.players[i].kills,
          $specials: req.body.players[i].specials,
          $ranged: req.body.players[i].ranged,
          $melee: req.body.players[i].melee,
          $damageDealt: req.body.players[i].damageDealt,
          $damageMonsters: req.body.players[i].damageMonsters,
          $damageTaken: req.body.players[i].damageTaken,
          $hs: req.body.players[i].hs,
          $saves: req.body.players[i].saves,
          $revives: req.body.players[i].revives,
          $ff: req.body.players[i].ff,
        },
        function(err) {
          if (err) {
            console.log('Error in app.post(/addGame/) on INSERTING played_in ON: ' + i);
            console.log('    error: ' + err);
            
            if (i === 3) res.send({ status: false, message: 'POST ERROR' });
          } 
          else {
            if (i === 3) res.send({ status: true, message: 'POST SUCCESS' });
          }
        }
      );
    };
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