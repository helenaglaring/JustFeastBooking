/* https://github.com/timtamimi/node.js-passport.js-template/blob/master/lib/routes.js
https://www.js-tutorials.com/nodejs-tutorial/user-authentication-using-jwt-json-web-token-node-js/#
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const {check, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const secret = 'verysecret';


const pool = require('../db/db');

/*-----------------------------------Import Middleware ------------------------------------------------*/
//Flyttet til index
const auth = require('../middleware/authentication');



/*----------------------------------- Signup ------------------------------------------------------*/
// GET route for user signup
//Flyttet til index
/*
router.get('/signup', auth.isNotLoggedIn, function (req, res) {
    res.render('user/signup', {
        title: 'Signup page',
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    })
});
*/
//Flyttet til index
// POST route for user signup
/*
router.post('/signup',
    // POST data validation, using express-validator
    [
        check('email', 'Invalid email').isEmail(),

        check('first_name', 'Udfyld venlgist "Fornavn" ').trim().not().isEmpty(),
        check('last_name', 'Udfyld venlgist "Efternavn"').trim().not().isEmpty(),
        check('email', 'Udfyld venlgist en E-mail').trim().not().isEmpty(),
        check('password', 'Password skal være på mindst 4 karakterer').trim().isLength({min:4}),
        // End of post data validation
    ],
    async function(req, res) {
        const validation_result = validationResult(req);
        // IF validation_result has no ERROR
        if(validation_result.isEmpty())  {
            try {
                const client = await pool.connect();
                await client.query('BEGIN');
                let {first_name, last_name, password, email } = req.body;
                let hash_pwd = await bcrypt.hash(password, 12);
                await JSON.stringify(client.query(`
                    SELECT user_id 
                    FROM "user" 
                    WHERE "email"=$1`,
                    [email], function(err, result) {
                        if(result.rows[0]) {
                            req.flash('error', "E-mail er allerede registreret");
                            res.redirect('signup');
                        } else {
                            client.query(`
                                INSERT INTO "user" (first_name, last_name, _password, email)
                                VALUES ($1, $2, $3, $4)`,
                                [first_name, last_name, hash_pwd, email],
                                function(err, result) {
                                    if(err) {
                                        console.log(err);
                                    } else {
                                        client.query('COMMIT');
                                        console.log(result.rows);
                                        req.flash('success', "Bruger oprettet");
                                        res.redirect('signup');
                                    }
                                }
                            );
                        }
                    }
                ));
                client.release();
            }
            catch(e) {
                throw(e)
            }
        } else {
            // Collect validation errors
            let err_val_messages = validation_result.errors.map( (error) => {
                return error.msg;
            });
            req.flash('error', err_val_messages);

            // RENDERING loginpage with validation errors
            res.redirect('signup');
        }
});*/


/*-----------------------------------Login page call ------------------------------------------------------*/
// GET route for user login
//flyttes
/*
router.get('/login', auth.isNotLoggedIn, function(req, res) {
   res.render('user/login', {
       title: 'Login',
       messages: {
           success: req.flash('success'),
           error: req.flash('error')
       }
    });
});*/
/*
// POST route for user login
router.post('/login',
    // POST data validation, using express-validator
    [
        check('email', 'Invalid email').isEmail(),
        check('password', 'Password skal være på mindst 4 karakterer').trim().isLength({min:4}),
        // End of post data validation
    ], async function(req, res) {
        const validation_result = validationResult(req);
        // IF validation_result has no ERROR
        if(validation_result.isEmpty())  {
            const client = await pool.connect();
            await client.query('BEGIN');
            let {password, email } = req.body;
            await JSON.stringify(client.query(`
                SELECT user_id, first_name, last_name, _password, email
                FROM "user" 
                WHERE "email"=$1`,
                [email], function(err, result) {
                    if (err) {
                        console.log(err);
                    }
                    if (result.rows[0]== null) {
                        req.flash('error', "Fejl i E-email. Eksisterer ikke.");
                        res.redirect('login');

                        // If the SELECT statement is successful, i.e. a User with that username does exist in the database,
                        // the password is retrieved from the database.
                    } else {
                        bcrypt.compare(password, result.rows[0]._password)
                            .then( (compareResult) => {
                                //Check if password matches
                                if (compareResult) {
                                    //req.session.userId = result.rows[0].user_id;
                                    //req.session.user = result.rows[0];
                                   //console.log(result.rows[0].user_id);
                                   const userID = result.rows[0].user_id;
                                   const token = jwt.sign({ user_id: userID}, secret);
                                   res.cookie('jwt-token', token);
                                   req.flash('success', `Du er nu logget ind.`);
                                   res.send();
                                   res.redirect('account');

                                } else {
                                    req.flash('error', "Incorrect password details");
                                    res.redirect('login');
                                }
                        }).catch( (err) => {
                            console.log(err);
                            req.flash('error','Error while checking password');
                            res.redirect('login');
                        })
                    }
                }
            ));
            client.release();

        } else {
            // Collect validation errors
            let err_val_messages = validation_result.errors.map( (error) => {
                return error.msg;
            });
            req.flash('error', err_val_messages);

            // RENDERING loginpage with validation errors
            res.redirect('login');
        }
    });

*/


/*---------------------------------------------Account page call ------------------------------------------------------*/
//flyttes
// GET route for user account
/*
router.get("/account", auth.isLoggedIn, function(req, res) {
    let user = req.user;
    let userId = user.user_id;

    if(userId !== null) {
        pool.query(`
            SELECT * FROM "user" 
            WHERE user_id=$1`, [userId],
            function(err, result) {
                if (err) {
                    console.log (err);
                } else {
                    //console.log(result);
                    res.render('user/account', {
                        title: 'Account',
                        user: user,
                        messages: {
                            success: req.flash('success'),
                            error: req.flash('error')
                        }
                    })
                }
            }
        )
    } else {
        req.flash('error', 'Ingen bruger er logget ind. Log ind før du kan se din profil.');
        res.redirect('login');
    }
});
*/

/*---------------------------------------------Logout page call ------------------------------------------------------*/
// GET route for user logout
// Sletter også session
router.get('/logout', auth.isLoggedIn, function(req, res){
    res.clearCookie("jwt-token");
    req.flash('success', "Logged out. See you soon!");
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('login');
    });
});


module.exports = router;

/* Gammel logout uden session
router.get('/logout', auth.isLoggedIn, function(req, res){
    res.clearCookie("jwt-token");
    req.flash('success', "Logged out. See you soon!");
    res.redirect('login');
});*/
