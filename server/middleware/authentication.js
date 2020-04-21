const pool = require('../db/db');
const jwt = require('jsonwebtoken');
const secret = 'verysecret';
/*-------------------------Middleware for user authentication-------------------------------------------*/

//-- Check if user is logged in --//
exports.isLoggedIn = function(req, res, next) {
    // Continue if user is logged in
    if(req.cookies && req.cookies['jwt-token']) {
        const decoded = jwt.verify(req.cookies['jwt-token'], secret);
        pool.query(`
            SELECT *
            FROM "user"
            WHERE user_id=$1`, [decoded.user_id])
            .then(result => {
                console.log("Bruger er logget ind med ID: " + result.rows[0].user_id);
                next()
            });

    } else {
        req.flash('error', "Ingen bruger logget ind");
        console.log("Ingen bruger logget ind");
       res.redirect('login');
    }

};
/* gammel:
    if(req.session.user) {
        return next();
    }
    // Redirect to login-page if no user is logged in
    req.flash('error', 'Ingen bruger logget ind');
    res.redirect('/login') // Redirect if not logged in
    */

//-- Check if user is already logged in --//
exports.isNotLoggedIn = function(req, res, next) {
    // Continue if no user is logged in
    if(!req.session.user) {
        return next();
    }
    // Redirect to user account page if user is already logged in
    req.flash('error', 'Du er allerede logget ind som bruger: ' + req.session.user.first_name);
    res.redirect('account') // Redirect if not logged in
};

