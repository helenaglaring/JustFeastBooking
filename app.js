/* Module dependencies */
const express = require('express');
const path = require('path');

/* Import middleware */
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
//const session = require('express-session');

/* Import routes  */
const routes = require('./server/routes/index');
const userRoutes = require('./server/routes/user');
const cartRoutes = require('./server/routes/cart');
const orderRoutes = require('./server/routes/order');

// Express-session and connect-pg-simple to store data in session
// https://openbase.io/js/connect-pg-simple
const pg = require('pg')
    , session = require('express-session')
    , pgSession = require('connect-pg-simple')(session);

const pgPool = new pg.Pool({
    // Insert pool options here
    host: "localhost",
    port: 5433,
    user: "postgres",
    database: "justfeastdb",
    password: "postgres",
});

//const pgSession = require('connect-pg-simple')(session);
//const pool = require('./server/db/db');

const flash = require('connect-flash');
const passport = require('passport');

/* Server configuration */
const app = express ();
const port = 3000;




/* All environments */

// Set views and view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));


// Apply cookie session middleware
app.use(session({ // Using session to flash messages
   store: new pgSession({
        pool: pgPool,
        tableName: 'session'
    }),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 180 * 60 * 1000 } // How long a session should live in ms, 1 hour.
}));

//Cookie and body-parser middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded ({
        extended: true,
    })
);

app.use(flash());
//app.use(validator());
app.use(passport.initialize());
app.use(passport.session());


/* Endpoints  */
app.use('/', routes);
/*
app.use('/user', userRoutes);
app.use('/cart', cartRoutes);
app.use('/order', orderRoutes);
*/

/* Connect to server */
app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});
