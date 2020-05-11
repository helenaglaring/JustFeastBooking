// Definerer router-objekt, som er en isoleret instans af middleware og routes.
const express = require('express');
const router = express.Router();


/*-----------------------------------Middleware----------------------------------------------*/
// Importerer middleware
const auth = require('../middleware/authentication');


/*----------------------------------- Controllers ---------------------------------------------*/

// DELIVERY-METHOD
const deliveryMethodControllers = require('../controllers/deliveryMethodControllers');

// DELIVERY-ADDRESS
const addressControllers = require('../controllers/addressControllers');

// PAYMENT
const paymentControllers = require('../controllers/paymentControllers');

// ORDER
const orderControllers = require('../controllers/orderControllers');


/*------------------------- Endpoints og route-handlers---------------------------------------*/


// Middleware der bruges for alle /checkout-routes, så de ikke kan tilgås hvis kurven er tom.
router.use(auth.isLoggedIn, auth.cartNotEmpty);


/*------------  DELIVERY  ---------------*/

// GET route for delivery-page
router.get('/delivery-method',  deliveryMethodControllers.delivMethodPage );//auth.cartNotEmpty,

// POST route for delivery-method information
router.post('/delivery-method', deliveryMethodControllers.create);



/*------------ DELIVERY-ADDRESS ---------------*/

// GET route for delivery-address page
// Middleware: Kun hvis bruger har valgt 'levering'. Ellers redirectes til 'payment'.
router.get('/delivery-address', auth.deliveryTrue, addressControllers.addressPage);

// POST route for delivery-address information
router.post('/delivery-address', addressControllers.create );


/*------------ PAYMENT ---------------*/
// GET route for payment-page
// Middleware: Tjekker om bruger allerede har betalt for ordren før.
router.get('/payment', auth.checkPayment, paymentControllers.paymentPage);

// POST route for payment information
router.post('/payment', paymentControllers.create);


/*------------ ORDER ---------------*/
router.post('/order/:id', orderControllers.placeOrder);



// Eksporterer 'router' så den er tilgængelig i app.js
module.exports = router;
