/*JWT: https://github.com/timtamimi/node.js-passport.js-template/blob/master/lib/routes.js
    https://www.js-tutorials.com/nodejs-tutorial/user-authentication-using-jwt-json-web-token-node-js/#*/

// Importerer moduler der bruges til at encode user-id som token gemt i session
const jwt = require('jsonwebtoken');
const secret = 'verysecret';

// Database-connection
const pool = require('../db/db');

// Importerer modeller
const User = require('../models/User');
const Order = require('../models/Order.js');
const Cart = require('../models/LineItem');



/*-------------------------Middleware for user authentication-------------------------------------------*/


//-- Check om bruger er logget ind --//
exports.isLoggedIn = function(req, res, next) {

    // Tjekker om cookies og jwt-token er sat. Hvis true er bruger logget ind.
    if(req.cookies && req.cookies['jwt-token']) {
        // Continue hvis bruger er logget ind
        // Verificerer token
        const decoded = jwt.verify(req.cookies['jwt-token'], secret);

        // Bruger det decodede user_id til at finde den specifikke bruger fra user-tabellen.
        // Finder specifik bruger i db ud fra user_id
        pool.query('SELECT * FROM "user" WHERE user_id = $1', [decoded.user_id])
            .then(result => {
                let {user_id, first_name, last_name, email, _password } = result.rows[0];
                let user = new User(user_id, first_name, last_name, email,_password);
                //console.log("Bruger er logget ind med ID: " + user.userID);
                req.session.user = user;
                next()

            })
            .catch(err => {
                console.log("Der er sket en fejl");
                console.log(err);
            })
    } else {
    // Bruger ikke logget ind. Redirect hvis ikke req.cookies og jwt-token er sat.
    req.flash('error', "Ingen bruger logget ind");
    console.log("Ingen bruger logget ind");
    res.redirect('/login');
    }
};



//--  Check om bruger ikke er logget ind --//
exports.isNotLoggedIn = function(req, res, next) {
    // Continue hvis ingen bruger er logget ind
    if(!req.session.user) {
        next();
    } else {
        // Redirect til user account side hvis bruger allerede er logget ind.
        req.flash('error', 'Du er allerede logget ind som bruger: ' + req.session.user.firstname);
        res.redirect('account/'+ req.session.user.userID)
    }
};



/*-------------------------------- Middleware for creating cart ------------------------------------------------------*/

//-- Create cart --//
// Middleware funktion der tjekker om der eksisterer en kurv med det specifikke user-id. Hvis ikke oprettes ny kurv.

// Funktion der henter specifik ordre fra db ud fra givent user_id og med status 'cart'
// Bruges i createCart middleware til at undersøge om den givne kunde allerede har en 'kurv

exports.createCart = function(req, res, next) {
    let userID = req.session.user.userID;
    // Find order-record i order-tabel med specifikt user_id
    pool.query( `SELECT * FROM "order" WHERE user_id = $1 AND status='cart'`, [userID])
        .then(result => {
            // Ordre er allerede oprettet som 'cart'.
            if (result.rows[0]) {
                // Returnerer record fra 'order'-tabel som har det specifikke user_id og status 'cart'
                let {order_id, user_id, order_date, status} = result.rows[0];
                // Instantierer nyt Order objekt
                let oldOrderCart = new Order(order_id, user_id, order_date, status);

                console.log("Cart er allerede oprettet med ordre-ID: " + oldOrderCart.orderID);
                console.log("Nuværende ordre: ");
                req.session.order = oldOrderCart;
                console.log(req.session.order);
                next();
            } else {
                // Opretter ny ordre med status som 'cart'. Gemmer nuværende cart i session.
                // Funktion der opretter ny 'order'-record i order-tabel med status 'cart'.
                // Bruges til at oprette ny 'kurv' når kunde kommer ind på produkt-siden.
                // Indsætter ny field med den givne kundes user_id.
                pool.query(`
                    INSERT INTO "order" (user_id, status)
                    VALUES ($1, 'cart') RETURNING *`, [userID])
                    .then(result => {
                        let {order_id, user_id, order_date, status} = result.rows[0];
                        let newOrderCart = new Order(order_id, user_id, order_date, status);

                        console.log("Cart er blevet oprettet med ordre-ID: " + newOrderCart.orderID);
                        console.log(newOrderCart);
                        req.session.order = newOrderCart;
                        req.session.lineItems = {};
                        next()
                    })
                    .catch(err => {
                        console.log(err)
                    });
            }
        })
        .catch( err =>  {
            console.log(err);
            next();
        });

};







/*-------------------------Middleware for checkouts-------------------------------------------*/


/*---------Delivery-method middleware --------*/

//-- Middleware to GET delivery-method page, when user submits cart. Redirect if empty cart --//
exports.cartNotEmpty = function(req, res, next) {
    let oldCart = req.session.lineItems ? req.session.lineItems : {};
    // Instantierer et nyt Cart-objekt ud fra den eksisterende session.
    let cart = new Cart(oldCart.items, oldCart.totalQty, oldCart.totalPrice, oldCart.deliveryFee);

    // Continue if there are line items in cart
    if(cart.totalQty===0) {
        console.log("Ingen produkter i kurven: " + cart.totalQty);
        // Redirect to cart index page if no items in cart
        req.flash('error', 'Du har ingen produkter i kurven');
        res.redirect('/products') // Redirect if not logged in
    } else {
        console.log("JUHU produkter i kurv - du kan fortsætte. Antal i kurv: " + cart.totalQty);
        return next();
    }
};


/*---------Address middleware -------*/


//-- Middleware til GET delivery-address page. Kun hvis bruger har valgt levering "delivery"--//
exports.deliveryTrue = function(req, res, next) {
    // Bruger funktion fra DeliveryMethod-model, der returnerer 'delivery'-field fra record gemt i db.
    let deliveryMethod = req.session.delivery ? req.session.delivery : {};
    console.log(deliveryMethod);
    if (deliveryMethod.deliveryIsTrue) {
        return next()
    } else {
        // Hvis kunde tilgår siden uden at have valgt levering vises fejlbesked og omdirigeres til payment.
        req.flash('error', 'Du har ikke valgt levering og skal derfor ikke angive leveringsoplysninger');
        res.redirect('payment')
    }
};


/*---------Payment middleware --------*/

//-- Checking if payment already has been made --//
// Funktion der finder specifik record i payment-tabel med givent order_id.
// Bruges i checkPayment middleware til at undersøge, om der allerede er en betaling knytttet til denne ordre.

exports.checkPayment = function (req, res, next) {
    let orderID = req.session.order.orderID;

    findPayment(orderID)
        .then(payment => {
            // Check if payment already has been made
            if (payment.isTrue === true) {
                req.flash('error', 'Du har allerede betalt');
                res.redirect('/order/' + orderID);
                console.log("Der er betalt")
                // Continue if no payment hasn't been made yet
            } else {
                console.log("Der er ikke betalt");
                next()
            }
        })
        .catch(err => {
            console.log(err);
            req.flash('error', 'noget gik galt');
            res.redirect('payment');
            });
};


// Hjælpenktion der finder specifik record i payment-tabel med givent order_id.
// Bruges i checkPayment middleware til at undersøge, om der allerede er en betaling knytttet til denne ordre.
function findPayment(orderID) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM payment WHERE order_id = $1', [orderID])
            .then(function (result) {
                if (result.rows[0]) {
                    resolve({isTrue: true});
                    console.log("Der er betalt")
                } else {
                    resolve({isTrue: false});
                    console.log("Der er ikke betalt")
                }
            })
            .catch(function (err) {
                reject(err);
            });
    });
};










/* NYESTE 'gamle version' af checkPayment uden hjælpefunktion
//-- Checking if payment already has been made --//
// Funktion der finder specifik record i payment-tabel med givent order_id.
// Bruges i checkPayment middleware til at undersøge, om der allerede er en betaling knytttet til denne ordre.

exports.checkPayment = function (req, res, next) {
    let orderID = req.session.order.orderID;
    let savedPayment = req.session.payment ? req.session.payment : {};

    // Check if payment already has been made
    if (savedPayment && savedPayment.orderID === orderID) {
        req.flash('error', 'Du har allerede betalt');
        res.redirect('/order/' + orderID);
        console.log("Der er betalt")
    }
    // Continue if no payment hasn't been made yet
    else {
        console.log("Der er ikke betalt");
        next()
    }
};*/



/* GAMMEL: isLoggedIn
//-- Check om bruger er logget ind --//
exports.isLoggedIn = function(req, res, next) {

    // Tjekker om cookies og jwt-token er sat. Hvis true er bruger logget ind.
    if(req.cookies && req.cookies['jwt-token']) {
        // Continue hvis bruger er logget ind
        // Verificerer token
        const decoded = jwt.verify(req.cookies['jwt-token'], secret);

        // Bruger det decodede user_id til at finde den specifikke bruger fra user-tabellen.
        User.findOneById(decoded.user_id)
            .then(user => {
                console.log("Bruger er logget ind med ID: " + user.user_id);
                req.session.user = user;
                next()
            })
            .catch(err => {
                console.log("Der er sket en fejl");
                console.log(err);
            })


    } else {
        // Bruger ikke logget ind. Redirect hvis ikke req.cookies og jwt-token er sat.
        req.flash('error', "Ingen bruger logget ind");
        console.log("Ingen bruger logget ind");
        res.redirect('/login');
    }
};

*/



/* GAMMEL createCart
exports.createCart = function(req, res, next) {
    // Find order-record i order-tabel med specifikt user_id
    Order.findCartByUser(req.session.user.user_id)
        .then(order => {
            // Ordre er allerede oprettet som 'cart'.
            if (order) {
                console.log("Cart er allerede oprettet med ordre-ID: " + order.order_id);
                console.log("Nuværende ordre: ");
                console.log(order);
                req.session.order = order;
                next();

            } else {
                // Opretter ny ordre med status som 'cart'. Gemmer nuværende cart i session.
                Order.createCart(req.session.user.user_id)
                    .then(cart => {
                        console.log(cart);
                        req.session.order = cart;
                        req.session.lineItems = {};
                        console.log("Cart er blevet oprettet med ordre-ID: " + req.session.order.order_id);
                        next()
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        })
        .catch( err => {
            console.log(err);
            next();
        })
};


 */



/* GAMMEL deliveryTrue
// Samme metode som nedenfor men bruger session istedet.
//-- Middleware to GET address page. Only if user has selected "delivery"--//
exports.deliveryTrue = function(req, res, next) {
    // Hvis levering er valgt indlæses siden hvor leveringsoplysninger skal læses
    if(req.session.delivery.delivery) {
        return next();
    }
    // Hvis ikke bruger har valgt levering sendes direkte videre til betaling
    res.redirect('payment') // Redirect if not logged in
};
-*/


/* GAMMEL deliveryTrue
//-- Middleware til GET delivery-address page. Kun hvis bruger har valgt levering "delivery"--//
exports.deliveryTrue = function(req, res, next) {
    // Bruger funktion fra DeliveryMethod-model, der returnerer 'delivery'-field fra record gemt i db.
    DeliveryMethod.findOne(req.session.order.order_id)
        .then(delivery=> {
            // Hvis delivery=true indlæses siden for leveringsaddresseoplysninger .
            if (delivery) {
                return next()
            } else {
                // Hvis kunde tilgår siden uden at have valgt levering vises fejlbesked og omdirigeres til payment.
                req.flash('error', 'Du har ikke valgt levering og skal derfor ikke angive leveringsoplysninger');
                res.redirect('payment')
            }
        })
        .catch(err => {
            console.log(err);
        })
};

*/





/*
// Funktion der finder specifik record i payment-tabel med givent order_id.
// Bruges i checkPayment middleware til at undersøge, om der allerede er en betaling knytttet til denne ordre.
exports.checkPayment = function (req, res, next)  {
    let orderID = req.session.order.order_id;
    pool.query('SELECT * FROM payment WHERE order_id = $1', [orderID])
        .then(result =>  {
            // Check if payment already has been made
            if (result.rows[0]) {
                req.flash('error', 'Du har allerede betalt');
                res.redirect('/order/' + orderID);
                console.log("Der er betalt")
            }
            // Continue if no payment hasn't been made yet
            else {
                console.log("Der er ikke betalt");
                next()
            }
        })
        .catch( (err) => {
            console.log(err);
            req.flash('error', 'noget gik galt');
            res.redirect('payment');
        });

    /////GAMMEL Payment.findOne
    Payment.findOne(req.session.order.order_id)
        .then(payment => {
            // Check if payment already has been made
            if (payment.isTrue === true) {
                req.flash('error', 'Du har allerede betalt');
                res.redirect('/order/' + req.session.order.order_id);
            }
            // Continue if no payment hasn't been made yet
            else {
                next()
            }
        })
        .catch( (err) => {
            console.log(err);
            req.flash('error', 'noget gik galt');
            res.redirect('payment');
        });
};
*/