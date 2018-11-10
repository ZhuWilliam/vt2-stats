const dbname = 'vt2.db';
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbname);

db.serialize(() => {
  db.run("CREATE TABLE player ("
          + "name TEXT,"
          + "steam_id INTEGER UNIQUE DEFAULT NULL,"
          + "PRIMARY KEY (name));");
  
  db.run("CREATE TABLE game ("
          + "id INTEGER PRIMARY KEY,"
          + "difficulty TEXT COLLATE NOCASE NOT NULL DEFAULT 'legend',"
          + "map TEXT COLLATE NOCASE NOT NULL,"
          + "did_win INTEGER DEFAULT 1);");
  
  db.run("CREATE TABLE played_in ("
          + "player_name TEXT NOT NULL,"
          + "game_id INTEGER NOT NULL,"
          + "character TEXT COLLATE NOCASE NOT NULL,"
          + "class TEXT COLLATE NOCASE NOT NULL,"
          + "total_kills INTEGER NOT NULL,"
          + "special_kills INTEGER NOT NULL,"
          + "ranged_kills INTEGER NOT NULL,"
          + "melee_kills INTEGER NOT NULL,"
          + "damage_dealt INTEGER NOT NULL,"
          + "damage_monsters INTEGER NOT NULL,"
          + "damage_taken INTEGER NOT NULL,"
          + "headshots INTEGER NOT NULL,"
          + "saves INTEGER NOT NULL,"
          + "revives INTEGER NOT NULL,"
          + "friendly_fire INTEGER NOT NULL,"
          + "FOREIGN KEY (player_name) REFERENCES player(name),"
          + "FOREIGN KEY (game_id) REFERENCES game(id),"
          + "PRIMARY KEY (player_name, game_id));");
});

console.log('Initialized SQLite3 database: ' + dbname);
console.log('------------------------------------');
db.close();