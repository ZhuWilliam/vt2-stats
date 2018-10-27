const dbname = 'vt2.db';
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(dbname);

db.serialize(() => {
  db.run("CREATE TABLE game ("
          + "patch_id INTEGER PRIMARY KEY AUTOINCREMENT,"
          + "patch TEXT COLLATE NOCASE UNIQUE NOT NULL);");
  
  db.run("CREATE TABLE player ("
          + "name TEXT COLLATE NOCASE,"
          + "steam_id INTEGER UNIQUE,"
          + "PRIMARY KEY (name));");
  
  db.run("CREATE TABLE run ("
          + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
          + "patch_id INTEGER NOT NULL,"
          + "official_realm INTEGER DEFAULT 1,"
          + "difficulty TEXT COLLATE NOCASE NOT NULL DEFAULT 'legend',"
          + "map TEXT COLLATE NOCASE NOT NULL,"
          + "victory INTEGER DEFAULT 1,"
          + "FOREIGN KEY (patch_id) REFERENCES game(patch_id));");
  
  db.run("CREATE TABLE played_in ("
          + "player_name TEXT COLLATE NOCASE,"
          + "run_id INTEGER,"
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
          + "FOREIGN KEY (run_id) REFERENCES run(id),"
          + "PRIMARY KEY (player_name, run_id));");
});

console.log('Initialized SQLite3 database: ' + dbname);
console.log('------------------------------------');
db.close();