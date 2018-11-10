const express = require('express');
const app = express();
app.use(express.static('vt2-stats'));

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('vt2.db');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(3000, () => {
  console.log('server started at http://localhost:3000/');
});

// GET requests
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

/*** Helper Functions ***/
/** Getters and Setters **/
const getPlayerByName = async (name) => {
  let stmt = db.prepare('SELECT * FROM player WHERE name=?');
  let promise = new Promise((resolve, reject) => {
    stmt.get(name, async (err, row) => {
      console.log('-- at getPlayerByName finalize');
      stmt.finalize();
      console.log('-- passed finalize');
      if (err) reject(err)
      
      resolve(row);
    });
  });
  
  return promise;
};

const getNewGameID = async () => {
  let stmt = db.prepare('SELECT COUNT(*) AS "count" FROM game');
  let promise = new Promise((resolve, reject) => {
    stmt.get((err, row) => {
      console.log('-- at getNewGameID finalize');
      stmt.finalize();
      console.log('-- passed finalize');
      if (err) reject(err);
      
      console.log("the next game ID is: " + (row.count+1));
      resolve(row.count + 1);
    });
  });

  return promise;
};

const insertGame = async (newGameID, difficulty, map, didWin) => {
  console.log('     IN insertGame: ' + difficulty);
  let stmt = db.prepare('INSERT INTO game VALUES (?, ?, ?, ?)')
  let promise = new Promise((resolve, reject) => {
    stmt.run([newGameID, difficulty, map, didWin], (err, statement) => {
      if (err) reject(err);
      console.log('-- at insertGame finalize');
      stmt.finalize();
      console.log('-- passed finalize');
      resolve();
    });
  });
  
  return promise;
};

const insertPlayer = async (name) => {
  console.log("----INSERTING INTO PLAYER");
  stmt = db.prepare('INSERT INTO player VALUES (?, NULL)');
  let promise = new Promise((resolve, reject) => {
    stmt.run(name, (err, statement) => {
      console.log('-- at insertPlayer finalize');
      stmt.finalize();
      if (err) reject(err);
      console.log('-- passed finalize');
      resolve();
    });
  });
  
  return promise;
};

const insertPlayedIn = async (data) => {
  console.log('inserting played_in: ' + data)
  stmt = db.prepare('INSERT INTO played_in VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  let promise = new Promise((resolve, reject) => {
    stmt.run(data, (err, statement) => {
      if (err) reject(err);
      console.log('-- at insertPlayedIn finalize');
      //stmt.finalize();
      console.log('-- passed finalize');
      resolve();
    });
  });
  
  return promise;
};

/*** POST requests ***/
/* Add a game to the database. */
app.post('/addGame/', async (req, res) => {
  // [p.name, newGameID, p.character, p.class, p.kills, p.specials, p.ranged, p.melee, p.damageDealt, p.damageMonsters, p.damageTaken, p.hs, p.saves, p.revives, p.ff]
  const newGameID = await getNewGameID();
  console.log("the difficulty: " + req.body.difficulty);
  await insertGame(newGameID, req.body.difficulty, req.body.map, req.body.didWin);
  
  const promises = req.body.players.map(p => {
      const insertIfNotExists = async (b) => {
        console.log('in insertIfNotExists: ' + p.name, ', b: ' + (b == null));
        if (b == null) {
          //console.log('    passed if of insert1');
          await insertPlayer(p.name);
          //console.log('    passed insert1: ' + p.name);
        }
      };
      
      const insertResults = async () => {
        //console.log('in insertResults: ' + p.name);
        await insertPlayedIn([p.name, newGameID, p.character, p.class, p.kills, p.specials, p.ranged, p.melee, p.damageDealt, p.damageMonsters, p.damageTaken, p.hs, p.saves, p.revives, p.ff]);
        //console.log('    passed insert2: ' + p.name);
      };
      
      return getPlayerByName(p.name).then(insertIfNotExists).then(insertResults).catch((reason) => { console.err("cyka"); } );
  });
  
  await Promise.all(promises).catch((reason) => { console.err("blyat"); });
  
  res.send({ status: true, message: 'POST SUCCESS'});
  
  /*const newGameID = await getNewGameID();
  console.log("newGameID: " + newGameID);
  await insertGame(newGameID, req.body.difficulty, req.body.map, req.body.didWin);
  
  const someFunc = () => {
    // stuff?
    
  };
  
  // Inserting all player info into (player) and (played_in)
  for (let i = 0; i < 4; ++i) {
    console.log("i: " + i);
    
    // If the player does not exist, add them to (player)
    const nameExists = !!(await getPlayerByName(req.body.players[i].name));
    if (!nameExists) {
      console.log("NEW NAME!");
      await insertPlayer(req.body.players[i].name);
    }
    
    console.log('inserting into played_in');
    await insertPlayedIn([
      req.body.players[i].name,
      newGameID,
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
    ]);
  };
  
  res.send({ status: true, message: 'POST SUCCESS' });*/
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