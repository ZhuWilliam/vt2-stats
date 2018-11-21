const express = require('express');
const app = express();
app.use(express.static('vt2-stats'));

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('vt2.db');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const moment = require('moment');

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
    stmt.get(name, (err, row) => {
      stmt.finalize();
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
      stmt.finalize();
      if (err) reject(err);
      
      resolve(row.count + 1);
    });
  });

  return promise;
};

const getPlayedGames = async (playerName) => {
  let stmt = db.prepare('SELECT COUNT(*) AS "count" FROM played_in WHERE player_name=?');
  let promise = new Promise((resolve, reject) => {
    stmt.get(playerName, (err, row) => {
      stmt.finalize();
      if (err) reject(err);
      
      resolve(row.count)
    });
  });
  
  return promise;
};

const insertGame = async (newGameID, difficulty, map, didWin, date) => {
  console.log('     IN insertGame: ' + difficulty);
  
  let stmt = db.prepare('INSERT INTO game VALUES (?, ?, ?, ?, ?)')
  let promise = new Promise((resolve, reject) => {
    stmt.run([newGameID, difficulty, map, didWin, date], (err, statement) => {
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
      //console.log('-- at insertPlayedIn finalize');
      //stmt.finalize();
      //console.log('-- passed finalize');
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
  await insertGame(newGameID, req.body.difficulty, req.body.map, req.body.didWin, req.body.date);
  
  const promises = req.body.players.map(p => {
      const insertIfNotExists = async (b) => {
        console.log('in insertIfNotExists: ' + p.name, ', b: ' + (b == null));
        if (b == null) {
          await insertPlayer(p.name);
        }
      };
      
      const insertResults = async () => {
        await insertPlayedIn([p.name, newGameID, p.character, p.class, p.kills, p.specials, p.ranged, p.melee, p.damageDealt, p.damageMonsters, p.damageTaken, p.hs, p.saves, p.revives, p.ff]);
      };
      
      return getPlayerByName(p.name).then(insertIfNotExists).then(insertResults).catch((reason) => { console.err("cyka"); } );
  });
  
  await Promise.all(promises).catch((reason) => { console.err("blyat"); });
  
  res.send({ status: true, message: 'POST SUCCESS'});
});

/* Checks if a certain player exists or not */
app.post('/searchPlayer', async (req, res) => {
  const playerName = req.body.playerName;
  const promise = getPlayerByName(playerName);
  console.log('the promise: ' + promise);
  
  promise.then((row) => {
    if (!row) {
      res.send({ status: false, message: 'POST FAILURE: Player "' + playerName + '" does not exist in the database.'});
    }
    else {
      console.log(row);
      res.send({ status: true, message: 'POST SUCCESS: Player "' + playerName + '" exists in the database.' });
    }
  });
});

/* Get an array of stats for a player. */
app.get('/stats/:playername', (req, res) => {
  const playerName = req.params.playername;
  let data = {};
  
  // Get total number of games in the database
  let promise = getNewGameID();
  promise.then((row) => {
    data.totalGames = (row.count - 1);
  });
  
  // Get total number of games played by the player
  promise = getPlayedGames(playerName);
  promise.then((row) => {
    data.playedGames = row.count;
  });
  
  // number of games won by player
  // average win rate of player
  // -- average win rate of player, per difficulty
  // array of played classes and their numbers
  // -- most played class, most played character
  // win rate per class
  // array of maps played and their numbers
  // -- win rate per map
  // average: damage dealt, kills, damage taken, ...
  
  res.send({
    status: true,
    message: 'GET SUCCESS: Player "' + playerName + '" exists in the database.',
    data: data
  });
});
