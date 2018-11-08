const dbname = 'vt2.db';
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(dbname);

console.log('Printing rows from each table of SQLite3 database: ' + dbname);
console.log('--------------------------------------------------------------------');

db.all('SELECT * FROM player LIMIT 4', function(err, rows) {
  console.log("(player)");
  console.log(rows);
});

db.all('SELECT * FROM game LIMIT 3', function(err, rows) {
  console.log("(game)");
  console.log(rows);
});

db.all('SELECT * FROM played_in LIMIT 2', function(err, rows) {
  console.log("(played_in)");
  console.log(rows);
});

db.close();