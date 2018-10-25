const dbname = 'vt2.db';
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(dbname);

db.serialize(() => {
  db.run("CREATE TABLE player ("
          + "name TEXT COLLATE NOCASE,"
          + "steam_id INTEGER,"
          + "PRIMARY KEY (name));");
  
  db.run("CREATE TABLE game ("
          + "id INTEGER NOT NULL,"
          + "official_realm INTEGER DEFAULT 1,"
          + "patch TEXT NOT NULL,"
          + "difficulty TEXT COLLATE NOCASE NOT NULL DEFAULT 'legend',"
          + "map TEXT COLLATE NOCASE NOT NULL,"
          + "victory INTEGER DEFAULT 1,"
          + "PRIMARY KEY (id));");
  
  db.run("CREATE TABLE played_in ("
          + "pname TEXT COLLATE NOCASE,"
          + "gid INTEGER,"
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
          + "FOREIGN KEY (pname) REFERENCES player(name),"
          + "FOREIGN KEY (gid) REFERENCES game(id),"
          + "PRIMARY KEY (pname, gid));");
});

console.log('Initialized SQLite3 database: ' + dbname);
console.log('------------------------------------');
db.close();