// kilde: https://github.com/anthonynsimon/node-postgres-registration/blob/master/models/user.js

/*----------------------------------- USER CONTROLLERS  ------------------------------------------------------*/
// Database-connection
const pool = require('../db/db');

// Importerer modeller
const User = require('../models/User');

// Importerer Hjælpefunktion der genererer jwt-token i userControllers. Skal sikre at user_id bliver kryptiseret inden det gemmes i session.
const Helper = require('./helper');


// Importerer bcrypt der bruges til at kryptere password inden det gemmes i db
const bcrypt = require('bcrypt');


module.exports = {
    // Signup page call: GET route for user signup
    signupPage: (req,res) => {
        res.render('user/signup', {
            title: 'Signup page',
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        })
    },

    // POST route for user signup
    // Funktion der opretter ny bruger og gemmer i databasen.
    // Argumentet er det objekt som bruger har sumbittet fra form og er valideret vha. user-validation middleware.
    signup: (req,res) => {
        let {first_name, last_name, email, password} = req.body;

        // Opretter ny bruger ud fra valideret form-data.
        // Tjekker først om email allerede eksisterer i user-tabel. Tager email som parameter.
        pool.query('SELECT user_id FROM "user" WHERE email = $1', [email])
            .then(result => {
                if (result.rows[0]) {
                    // Redirect hvis email allerede eksisterer.
                    req.flash('error', 'Email eksisterer allerede.');
                    res.redirect('signup')
                }
                // Email er unik og ny bruger kan oprettes.
                else {
                    // bruger bcrypt til at hashe brugerens submittede password.
                    bcrypt.hash(password, 10, (err, hash) => {
                        if (err) {
                            throw err;
                        } else {
                            // Now we can store the password hash in db.
                            // Indsætter bruger i db med værdier fra form og hashed-psw
                            pool.query(`INSERT INTO "user" (first_name, last_name, _password, email)
                                VALUES ($1, $2, $3, $4) RETURNING *`, [first_name, last_name, hash, email])
                                .then(result => {
                                    // Returnerer user-record der lige er blevet sat ind i db
                                    let {user_id, first_name, last_name, email, _password} = result.rows[0];
                                    let newUser = new User(user_id, first_name, last_name, email, _password);
                                    console.log("Ny bruger oprettet:");
                                    console.log(newUser);

                                    // Omdirigerer til login-side når bruger er succesfuldt oprettet.
                                    req.flash('success', "Bruger oprettet");
                                    res.redirect('login');
                                })
                                .catch(err => {
                                    // Ved fejl og validation errors reloades siden med respektive fejlbeskeder.
                                    console.log(err);
                                    res.redirect('signup');
                                });
                        }
                    });
                }
            })
            .catch(err => {
                // Ved fejl og validation errors reloades siden med respektive fejlbeskeder.
                console.log(err);
                res.redirect('signup');
            });
    },



    // Login page call: GET route for user login
    loginPage: (req,res) => {
        res.render('user/login', {
            title: 'Login',
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    },


    // POST route for user login
    login: (req, res) => {
        let {email, password} = req.body;
        console.log(email);
        // Bruger login-funktion fra User-model til at logge bruger ind
        pool.query('SELECT * FROM "user" WHERE email = $1', [email])
            .then(result => {
                if(result.rows[0]) {
                    let {user_id, first_name, last_name, email, _password} = result.rows[0];
                    let user = new User(user_id, first_name, last_name, email, _password);

                    console.log("E-mail eksisterer");
                    console.log(user);
                    bcrypt.compare(password, user.password)
                        .then(compareResult => {
                            // Resolver hvis password matcher
                            if (compareResult) {
                                // Sætter user_id som JWT-token når bruger er logget ind
                                const token = Helper.generateToken(user.userID);
                                res.cookie('jwt-token', token);

                                // Gemmer logget ind user i session
                                req.session.user = user;
                                console.log("User-id obj:");
                                console.log(req.session.user);
                                console.log("User-id:");
                                console.log(req.session.user.userID);

                                // Omdirigerer til user account side når bruger er logget succesfuldt ind
                                req.flash('success', `Du er nu logget ind.`);
                                res.redirect('account/' + user.userID);
                            } else {
                                // Rejectes hvis det indtastede password ikke stemmer overens med det i db.
                                req.flash('error', 'Forkert password');
                                res.redirect('login');
                            }
                        })
                        .catch((err) => {
                            throw err;
                        });
                } else {
                    req.flash('error', 'E-mail eksisterer ikke');
                    res.redirect('login');
                }
            })
            .catch(err => {
                console.log(err);
                req.flash('error', 'der er sket en fejl');
                // RENDERING loginpage med validation errors
                res.redirect('login');
            })
    },



    // Account page call: GET route for user account
    account: (req, res) => {
        let userID = req.params.id;
        // Finder specifik bruger i db ud fra user_id
        pool.query('SELECT * FROM "user" WHERE user_id = $1', [userID])
            .then(result => {
                if(result.rows[0]) {
                    let {user_id, first_name, last_name, email, _password } = result.rows[0];
                    let user = new User(user_id, first_name, last_name, email,_password);
                    console.log(user);
                    res.render('user/account', {
                        title: 'Account',
                        user: user,//req.session.user
                        messages: {
                            success: req.flash('success'),
                            error: req.flash('error')
                        }
                    })
                } else {
                    req.flash('error', 'Ingen bruger fundet');
                    res.redirect('/')
                }
            })
            .catch(err => {
                console.log(err);
                req.flash('error', err);
                res.redirect('/');
            })
    },



    // GET route for user logout
    // Sletter også session
    logout: (req, res) => {
        // Når bruger logger ud skal den nuværende kurv (order med status 'cart') også slettes fra db.
        // Derfor sletter order-record i order'tabel ud fra det givne order_id.

        // Deklarerer værdien gemt i session.order i variablen "order", hvis ikke der er gemt noget
        // Er der endnu ikke oprettet en ordre til kundens 'cart' og derfor sættes værdien til et tomt objkt.
        let order = req.session.order ? req.session.order : {};

        // Bruger if-statement til at undersøge om der er oprettet en order med status som 'cart' i db.
        // Hvis order=== undefined er der endnu ikke oprettet et cart, og derfor kommer man ikke ind i if-statement
        if (!order === undefined) {
            // Sørger for at slette order med status 'kurv' i db hvis kunde logger ud inden at have gennemført ordre.
            // Funktion der sletter en order-record i databasen med status='cart' og det aktuelle order_id.
            pool.query(`DELETE FROM "order" WHERE order_id=$1 AND status='cart' RETURNING *`, [order.orderID])
                .then(result => {
                    console.log("Kurv slettes");
                    console.log(result.rows[0]);
                })
                .catch(err => console.log(err));
        }
        // Sletter jwt-token i cookies og session.
        res.clearCookie("jwt-token");
        req.flash('success', "Logged out. See you soon!");
        req.session.destroy((err) => {
            if(err) {
                return console.log(err);
            }
            console.log("Bruger er logget ud");
            res.redirect('login');
        });
    },


    // DELETE request der sendes via fetch metode fra front end. Sletter user via user_id der sendes som param :id
    deleteUser: (req, res) => {
        let userID = req.params.id;

        // Funktion der sletter user-record fra user-tabel ud fra specifikt user_id. Bruges hvis user vil slette sin egen konto.
        pool.query(`
                DELETE FROM "user"
                WHERE user_id=$1  RETURNING *`, [userID])
            . then( result => {
                // Returnerer den record der er blevet slettet fra user-tabel
                console.log("Bruger slettet:");
                console.log(result.rows[0]);

                // jwt-cookies og session skal også slettes når bruger slettes
                res.clearCookie("jwt-token");
                req.flash('success', "Bruger slettet");
                req.session.destroy(err => {
                    if(err) {
                        return console.log(err);
                    }
                    // FETCH omdirigerer til homepage
                    res.end()
                });
            })
            .catch(err => {
                console.log(err)
            })
    }
};






/* GAMLE. Virkede med de funktioner i modellaget inden vi implementerede klasser,
// START GAMLE
module.exports = {
    // Signup page call: GET route for user signup
    signupPage: (req,res) => {
        res.render('user/signup', {
            title: 'Signup page',
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        })
    },

    // POST route for user signup
    signup: (req,res) => {
        // Opretter ny bruger ud fra valideret form-data.
        User.create(req.body)
            .then(function(result) {
                console.log(result);
                // Omdirigerer til login-side når bruger er succesfuldt oprettet.
                req.flash('success', "Bruger oprettet");
                res.redirect('login');
            })
            .catch(function(errors) {
                // Ved fejl og validation errors reloades siden med respektive fejlbeskeder.
                req.flash('error', errors);
                res.redirect('signup');
            });
    },


    // Login page call: GET route for user login
    loginPage: (req,res) => {
        res.render('user/login', {
            title: 'Login',
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    },


    // POST route for user login
    login: (req, res) => {
        // Bruger login-funktion fra User-model til at logge bruger ind
        User.login(req.body)
            .then(function (result) {
                // Sætter user_id som JWT-token når bruger er logget ind
                const token = Helper.generateToken(result.id);
                res.cookie('jwt-token', token);

                // Gemmer logget ind user i session
                req.session.user = result.user;
                console.log("User-id obj:");
                console.log(req.session.user);
                console.log("User-id:");
                console.log(req.session.user.user_id);

                // Omdirigerer til user account side når bruger er logget succesfuldt ind
                req.flash('success', `Du er nu logget ind.`);
                res.redirect('account/' + result.user.user_id);
            })
            .catch(function (errors) {
                console.log(errors);
                req.flash('error', errors);
                // RENDERING loginpage med validation errors
                res.redirect('login');
            })
    },

    // Account page call: GET route for user account
    account: (req, res) => {
        User.findOneById(req.params.id)
            .then(user => {
                console.log(user);
                res.render('user/account', {
                    title: 'Account',
                    user: user,//req.session.user
                    messages: {
                        success: req.flash('success'),
                        error: req.flash('error')
                    }
                })
            })
            .catch(err => {
                console.log(err);
                req.flash('error', err);
                res.redirect('/');
            })
    },
    // GET route for user logout
    // Sletter også session
    logout: (req, res) => {
        // Når bruger logger ud skal den nuværende kurv (order med status 'cart') også slettes fra db.
        // Derfor bruges funktionen deleteOne der sletter order-record i order'tabel ud fra order_id.

        // Deklarerer værdien gemt i session.order i variablen "order", hvis ikke der er gemt noget
        // Er der endnu ikke oprettet en ordre til kundens 'cart' og derfor sættes værdien til et tomt objkt.
        let order = req.session.order ? req.session.order : {};

        // Bruger if-statement til at undersøge om der er oprettet en order med status som 'cart' i db.
        // Hvis order=== undefined er der endnu ikke oprettet et cart, og derfor kommer man ikke ind i if-statement
        if (!order === undefined) {
            // Sørger for at slette order med status 'kurv' i db hvis kunde logger ud inden at have gennemført ordre.
            console.log("Slet kurv" + order.order_id);
            Order.deleteOne(req.session.order.order_id)
                .then(result => {
                    console.log("Kurv slettes");
                    console.log(result);
                })
                .catch(err => console.log(err));
        }
        // Sletter jwt-token i cookies og session.
        res.clearCookie("jwt-token");
        req.flash('success', "Logged out. See you soon!");
        req.session.destroy((err) => {
            if(err) {
                return console.log(err);
            }
            console.log("Bruger er logget ud");
            res.redirect('login');
        });
    },

    // Slet bruger via user_id der sendes som param :id
    // DELETE request der sendes via fetch metode fra front end
    deleteUser: (req, res) => {
        User.deleteOne(req.params.id)
            . then( result => {
                console.log("Bruger slettet: ");
                console.log(result);

                // jwt-cookies og session skal også slettes når bruger slettes
                res.clearCookie("jwt-token");
                req.flash('success', "Bruger slettet");
                req.session.destroy((err) => {
                    if(err) {
                        return console.log(err);
                    }
                    // FETCH omdirigerer til homepage
                    res.end()
                });
            })
            .catch(err => {
                console.log(err)
            })
    }
};*/
/// SLUT GAMLE