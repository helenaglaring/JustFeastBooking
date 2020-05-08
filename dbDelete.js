/*--dbDelete.js-------------------------- delete DB -----------------------------------------------------*/
// Importerer db-connection
const pool = require('./server/db/db');


// Delete db Schema

pool.query(`

    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    
    
    `)
    .then( (res) => {
        console.log(res);
    })
    .catch((err) => {
        console.log(err);
    });