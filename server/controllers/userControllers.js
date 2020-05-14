/*----------------------------------- USER CONTROLLERS  ------------------------------------------------------*/
// Database-connection
const pool = require('../db/db');

// Importerer modeller
const User = require('../models/User');
const Order = require('../models/Order.js');

// Importerer Hjælpefunktioner der genererer jwt-token i userControllers. Skal sikre at user_id bliver kryptiseret inden det gemmes i session.
// Og funktioner der bruger  bcrypt til at kryptere  password inden det gemmes i db og  verificere password ved login
const Helper = require('./helper');



module.exports = {
    // Signup page call: GET route for user signup
    signupPage: (req, res) => {
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
    signup: async (req, res) => {
        let {first_name, last_name, email, password} = req.body;
        let user = new User(null, first_name, last_name, email, password);

        // Opretter ny bruger ud fra valideret form-data.
        // Tjekker først om email allerede eksisterer i user-tabel. Tager email som parameter.
        try {
            let {rows} = await pool.query('SELECT user_id FROM "user" WHERE email = $1', [user.email])
                .then(result => {
                    return result;
                })
                // query error
                .catch(err => {
                    return console.error('Error executing query', err.stack)
                });
            if (rows[0]) {
                // Redirect hvis email allerede eksisterer.
                req.flash('error', 'Email eksisterer allerede.');
                return req.session.save(function (err) {
                    return res.redirect('/user/signup')
                })
            }
            // Email er unik og ny bruger kan oprettes.
            console.log("Email er unik og ny bruger kan oprettes...");

            // bruger Helperfunktion der bruger bcrypt til at hashe brugerens submittede password.
            const hashPassword = Helper.hashPassword(user.password);

            // Nu kan vi gemme de hashede password i db.
            // Indsætter bruger i db med værdier fra form og hashed-psw
            let newUser = await pool.query(`INSERT INTO "user" (first_name, last_name, _password, email)
                        VALUES ($1, $2, $3, $4) RETURNING *`, [user.firstname, user.lastname, hashPassword, user.email])
                .then(result => {
                    // Returnerer user-record der lige er blevet sat ind i db
                    user.userID = result.rows[0].user_id;
                    return user;
                })
                // query error
                .catch(err => {
                    return console.error('Error executing query', err.stack)
                });

            console.log("Ny bruger oprettet:");
            console.log(newUser);
            // Omdirigerer til login-side når bruger er succesfuldt oprettet.
            req.flash('success', "Bruger oprettet");
            return req.session.save(function (err) {
                return res.redirect('/user/login')
            })

        } catch (error) {
            // Ved fejl og validation errors reloades siden med respektive fejlbeskeder.
            console.log(err);
            return res.redirect('/user/signup');
        }
    },


    // Login page call: GET route for user login
    loginPage: (req, res) => {
        res.render('user/login', {
            title: 'Login',
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    },
    // POST route for user login
    login: async (req, res) => {
        let {email, password} = req.body;

        try {
            // Bruger login-funktion fra User-model til at logge bruger ind
            let user = await pool.query('SELECT * FROM "user" WHERE email = $1', [email])
                .then(result => {
                    let {user_id, first_name, last_name, email, _password} = result.rows[0];
                    return new User(user_id, first_name, last_name, email, _password);
                })
                // query error
                .catch(err => {
                    return console.error('Error executing query', err.stack)
                });
            if (!user) {
                console.log("E-mail eksisterer Ikke.");
                req.flash('error', 'E-mail eksisterer ikke');
                // Gemmer session inden der redirectes så de gemte oplysninger kan tilgås.
                return req.session.save(function (err) {
                    res.redirect('/user/login');
                })
            }
            console.log("E-mail eksisterer. Verificerer password...");

            // Bruger helper-function der bruger bcrypt til at verificere password.
            // Første parameter er det bruger har indtastet. anden parameter er hashed psw hentet fra db,
            if (!Helper.comparePassword(password, user.password)) {
                // Redirect til login hvis det indtastede password ikke stemmer overens med det i db.
                console.log("Password ikke verificeret! ");
                req.flash('error', 'Forkert password');
                // Gemmer session inden redirect
                return req.session.save(function (err) {
                    res.redirect('/user/login');
                })
            }
            console.log("password verificeret ...");

            // Sætter user_id som JWT-token når bruger er logget ind
            const token = Helper.generateToken(user.userID);
            res.cookie('jwt-token', token);

            /*
            // Omdirigerer til user account side når bruger er logget succesfuldt ind
            req.flash('success', `Du er nu logget ind.`);
            return res.redirect('account/' + user.userID);*/

            // Omdirigerer til bestillingsside når bruger er logget succesfuldt ind
            req.flash('success', `Du er nu logget ind.`);

            // Gemmer session inden der redirectes
            return req.session.save(function (err) {
                return res.redirect( '/products');
            })

        } catch (err) {
            console.log(err);
            req.flash('error', 'der er sket en fejl');
            // RENDERING loginpage med validation errors. Gemmer session inden redirect
            return req.session.save(function (err) {
                res.redirect('/user/login');
            })
        }
    },




    // Account page call: GET route for user account
    account: async (req, res) => {
        // Sætter userID til enten at hente fra session eller sætter det til et tomt objekt hvis der ikke findes noget i session
        let userID = req.session.user.userID || req.params.id || {};
        //If statement der eksekveres hvis userID er TRUE

        try {
            // Tjekker først om userID er true, og om der altså er gemt en user i session.
            if (!userID) {
                console.log("req.session.user.userID eller req.params.id er false");
                req.flash('error', "Ingen bruger logget ind!!");
                return req.session.save(function (err) {
                    res.redirect('/');
                })
            }
            // Finder specifik bruger i db ud fra user_id
            let user = await pool.query('SELECT * FROM "user" WHERE user_id = $1', [userID])
                .then(result => {
                    let {user_id, first_name, last_name, email, _password} = result.rows[0];
                    return new User(user_id, first_name, last_name, email, _password);
                })
                // query error
                .catch(err => {
                    return console.error('Error executing query', err.stack)
                });
            if (!user) {
                req.flash('error', 'Ingen bruger fundet');
                return req.session.save(function (err) {
                    res.redirect('/');
                })
            }
            console.log("Bruger fundet i db. Omdirigerer til bruger-account for user: ");
            console.log(user);

            return res.render('user/account', {
                title: 'Account',
                user: user,//samme som req.session.user
                messages: {
                    success: req.flash('success'),
                    error: req.flash('error')
                }
            })

        } catch (err) {
            console.log(err);
            return res.status(500);
        }
    },


    // GET route for user logout
    // Sletter også session
    logout: async (req, res) => {
        // Når bruger logger ud skal den nuværende kurv (order med status 'cart') også slettes fra db.
        // Derfor sletter order-record i order'tabel ud fra det givne order_id.

        // Deklarerer værdien gemt i session.order i variablen "order", hvis ikke der er gemt noget
        // Er der endnu ikke oprettet en ordre til kundens 'cart' og derfor sættes værdien til et tomt objkt.
        let order = req.session.order ? req.session.order : {};
        let orderStatus = order.orderID ? order.status : {};
        console.log("Bruger har en kurv der skal slettes: " + !!order.orderID);

        try {
            // Bruger if-statement til at undersøge om der er oprettet en order med status som 'cart' i db.
            // Hvis order.status==='cart er false eller undefined er der endnu ikke oprettet et cart, og derfor kommer man ikke ind i if-statement
            if (order.orderID && orderStatus==="cart") {
                console.log("Bruger har tilnyttet en ordre med status 'cart'...");
                // Sørger for at slette order med status 'kurv' i db hvis kunde logger ud inden at have gennemført ordre.
                // Funktion der sletter en order-record i databasen med status='cart' og det aktuelle order_id.
                let deletedOrderCart = await pool.query(`DELETE FROM "order" WHERE order_id=$1 AND status='cart' RETURNING *`, [order.orderID])
                    .then(result => {
                        let {order_id, user_id, order_date, status} = result.rows[0];
                        return new Order(order_id, user_id, order_date, status)
                    })
                    .catch(err => console.log(err));
                console.log("Nuværende kurv slettes: ");
                console.log(deletedOrderCart);
            }
            // Sletter jwt-token i cookies og session.
            res.clearCookie("jwt-token");
            req.flash('success', "Logged out. See you soon!");
            req.session.destroy((err) => {
                if (err) {
                    return console.log(err);
                }
                console.log("Bruger er logget ud");
                return res.redirect('/');
            });
        } catch (err) {
            console.log(err);
            return res.status(500);
        }
    },


    // DELETE request der sendes via fetch metode fra front end. Sletter user via user_id der sendes som param :id
    deleteUser: async (req, res) => {
        let userID = req.params.id;

        try {
            // Sletter user-record fra user-tabel ud fra specifikt user_id. Bruges hvis user vil slette sin egen konto.

            let deletedUser = await pool.query(`DELETE FROM "user" WHERE user_id=$1  RETURNING *`, [userID])
                .then(result => {
                    // Returnerer den record der er blevet slettet fra user-tabel
                    let {user_id, first_name, last_name, email, _password} = result.rows[0];
                    return new User(user_id, first_name, last_name, email, _password);
                })
                // query error
                .catch(err => {
                    return console.error('Error executing query', err.stack)
                });

            if (!deletedUser) {
                console.log("Der skete en fejl. Bruger er ikke slettet");
                req.flash('error', "Der skete en fejl. Bruger er ikke slettet");
                return req.session.save(function (err) {
                    res.redirect('/account');
                })
            }

            console.log("Bruger er slettet fra db: ");
            console.log(deletedUser);

            // jwt-cookies og session skal også slettes når bruger slettes
            res.clearCookie("jwt-token");
            req.session.destroy(err => {
                if (err) {
                    return console.log(err);
                }
                // FETCH omdirigerer til homepage
                res.end()
            });
        } catch (err) {
            console.log(err);
            return res.status(500);
        }
    }
};


// Inspiration fra følgende link til implementering af nogle af vores funktioner i userControllers.js
// https://github.com/anthonynsimon/node-postgres-registration/blob/master/models/user.js
// Login routehandler: https://www.codementor.io/@olawalealadeusi896/building-a-simple-api-with-nodejs-expressjs-postgresql-db-and-jwt-3-mke10c5c5


/*----------------------------------- Skraldespand ------------------------------------------------------*/
/* GAMLE 1
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
                  // bruger Helperfunktion der bruger bcrypt til at hashe brugerens submittede password.
                  const hashPassword = Helper.hashPassword(password);
                  // Now we can store the password hash in db.
                  // Indsætter bruger i db med værdier fra form og hashed-psw
                  pool.query(`INSERT INTO "user" (first_name, last_name, _password, email)
                      VALUES ($1, $2, $3, $4) RETURNING *`, [first_name, last_name, hashPassword, email])
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

          })
          .catch(err => {
              // Ved fejl og validation errors reloades siden med respektive fejlbeskeder.
              console.log(err);
              res.redirect('signup');
          });
  },

   */



/* GAMLE 1: login
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

                                   // Omdirigerer til "menukort" /products. Har ændret til dette istedet for account
                                   req.flash('success', `Du er nu logget ind.`);
                                   res.redirect('products');
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
   */
/*
    try {
        // Bruger login-funktion fra User-model til at logge bruger ind
        let user = await pool.query('SELECT * FROM "user" WHERE email = $1', [email])
            .then(result => {
                let {user_id, first_name, last_name, email, _password} = result.rows[0];
                return new User(user_id, first_name, last_name, email, _password);
            })
            // query error
            .catch(err => {
                return console.error('Error executing query', err.stack)
            });
if (!user) {
    console.log("E-mail eksisterer Ikke.");
    req.flash('error', 'E-mail eksisterer ikke');
    return res.redirect('login');
}*/




/*
    // Nyeste gamle version af account
    // Account page call: GET route for user account
    account: (req, res) => {
        // Sætter userID til enten at hente fra session eller sætter det til et tomt objekt hvis der ikke findes noget i session
        let userID = req.session.user.userID || req.params.id || {};
        //If statement der eksekveres hvis userID er TRUE
        if (userID) {
            // Finder specifik bruger i db ud fra user_id
            pool.query('SELECT * FROM "user" WHERE user_id = $1', [userID])
                .then(result => {
                    if (result.rows[0]) {
                        let {user_id, first_name, last_name, email, _password} = result.rows[0];
                        let user = new User(user_id, first_name, last_name, email, _password);
                        console.log(user);
                        res.render('user/account', {
                            title: 'Account',
                            user: user,//samme som req.session.user
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
        }
        else{
            console.log(err);
            req.flash('error',err);
            res.redirect('/');
        }},

*/





/* GAMLE 2
Virkede med de funktioner i modellaget inden vi implementerede klasser,

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