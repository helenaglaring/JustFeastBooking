
/*------------------ SET UP configuration of PostgreSQL connection------------------------------------------*/
// Forbindelse til Databasen etableres her

// Opretter ny pool med  configuration:
const { Pool } = require('pg');

// Create new database instance and use the following credentials:
const pool = new Pool( {
    host: "localhost",
    port: 5433,
    user: "testUser",
    database: "testdb",
    password: "password",
});

// Acquires a client from the pool.
pool.on('connect', () => {
    console.log('connected to the Database');
});

/*
pool.query('SELECT NOW()').then(result => {
    console.log(result.rows)
    pool.end()
});*/

module.exports = pool;
