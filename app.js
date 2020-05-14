
/*--app.js--------------------------APP configuration -----------------------------------------------------*/


// Module dependencies
const express = require('express');
const path = require('path');

// Importerer third-party middleware
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');


// Express-session and connect-pg-simple to store data in session. Kilde: https://openbase.io/js/connect-pg-simple
const pg = require('pg')
    , session = require('express-session')
    , pgSession = require('connect-pg-simple')(session);

const flash = require('connect-flash');

// Import route handlers
const routes = require('./server/routes/index');


const pgPool = new pg.Pool({
    // Insert pool options here
    host: "localhost",
    port: 5433,
    user: "testUser",
    database: "testdb",
    password: "password",
});


// Server configuration
const app = express ();
const port = 3000;



// Set views and view engine
app.set('views', path.join(__dirname, '/server/views'));
app.set('view engine', 'ejs');

// Set up public files
app.use(express.static(path.join(__dirname, 'public')));



//Cookie and body-parser middleware
//https://medium.com/@ratan_kumar/a-sweet-tale-of-cookies-and-sessions-with-node-js-5fe255b702ac

app.use(cookieParser());

// Apply cookie session middleware

app.use(session({
   store: new pgSession({
        pool: pgPool,
        tableName: 'session'
    }),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 180 * 60 * 1000 } // How long a session should live in ms, 1 hour.
}));


app.use(bodyParser.json());

app.use(
    bodyParser.urlencoded ({
        extended: true,
    })
);
// Using connect-flash with session to flash messages
app.use(flash());


// Endpoints
app.use('/', routes);



// Error-handling middleware. Kilde: https://www.hacksparrow.com/webdev/express/custom-error-pages-404-and-500.html
// Handle 404
app.use(function(req, res) {
    res.status(404);
    res.render('error', {title: '404: File Not Found'});
});

// Handle 500
app.use(function(error, req, res, next) {
    console.log(error);
    res.status(500);
    res.render('error', {
        title:'500: Internal Server Error'});
});


// Connect to server
app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});


// Kilde: https://medium.com/@selvaganesh93/how-node-js-middleware-works-d8e02a936113

