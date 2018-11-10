const dbname = 'vt2.db';
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbname);

console.log('Printing 1 whole game of SQLite3 database: ' + dbname);
console.log('--------------------------------------------------------------------');

db.all('SELECT * FROM player LIMIT 5', (err, rows) => {
  console.log("(player)");
  console.log(rows);
});

db.all('SELECT * FROM game LIMIT 2', (err, rows) => {
  console.log("(game)");
  console.log(rows);
});

db.all('SELECT * FROM played_in LIMIT 5', (err, rows) => {
  console.log("(played_in)");
  console.log(rows);
});

db.close();