// Definerer router-objekt, som er en isoleret instans af middleware og routes.
const express = require('express');
const router = express.Router();


/*-----------------------------------Middleware----------------------------------------------*/
// Importerer middleware
const auth = require('../middleware/authentication');

const {
    signupValidationRules,
    signupValidate,
    loginValidationRules,
    loginValidate} = require('../middleware/user-validation.js');


/*-----------------------------------Controllers ---------------------------------------------*/
// Importerer alle controllers

const homeController = require('../controllers/homeController');

// USER
const userControllers = require('../controllers/userControllers');

// PRODUCTS
const productControllers = require('../controllers/productControllers');

// CART
const cartControllers = require('../controllers/cartControllers');

// DELIVERY-METHOD
const deliveryMethodControllers = require('../controllers/deliveryMethodControllers');

// DELIVERY-ADDRESS
const addressControllers = require('../controllers/addressControllers');

// PAYMENT
const paymentControllers = require('../controllers/paymentControllers');

// ORDER
const orderControllers = require('../controllers/orderControllers');


/*------------------------- Endpoints og route-handlers---------------------------------------*/


/*--------------------------- INDEX-PAGE endpoint -----------------------------*/
// GET index page
router.get('/', homeController);

/*--------------------------- PRODUCTS endpoint -----------------------------*/
// GET route for products page.
// Viser alle produkter fra databasen.

router.get('/products',  auth.isLoggedIn, auth.createCart, productControllers.productPage);//



/*--------------------------- USER endpoints -----------------------------*/

/*------------- SIGNUP ------------------*/
// GET route for signup page
router.get('/user/signup', auth.isNotLoggedIn, userControllers.signupPage);

// POST route for user signup
router.post('/user/signup',signupValidationRules(), signupValidate, userControllers.signup);


/*------------- LOGIN -------------------*/
// GET route for login page
router.get('/user/login', auth.isNotLoggedIn, userControllers.loginPage);
// POST route for user login
router.post('/user/login', loginValidationRules(), loginValidate, userControllers.login);

/*------------- ACCOUNT  ---------------*/
// GET route for user account page
// Middleware: Tillader kun adgang hvis bruger er logget ind.
router.get('/user/account', auth.isLoggedIn, userControllers.account);

router.get('/user/account/:id', auth.isLoggedIn, userControllers.account);

/*------------- LOG OUT------------------*/
// GET route for user logout
// Middleware: Bruger kan kun logge ud, hvis denne allerede er logget ind.
router.get('/user/logout', auth.isLoggedIn, userControllers.logout);

/*----------- DELETE USER ---------------*/
// DELETE route for deleting user
// Middleware: Bruger skal være logget ind.
router.delete('/user/delete/:id', auth.isLoggedIn, userControllers.deleteUser);



/*--------------------------- CART endpoints -----------------------------*/

// Middleware der gælder for alle /cart routes, der sikrer at bruger er logget ind.
router.use('/cart', auth.isLoggedIn);

// PUT route for adding item to cart
router.put('/cart/lineitems/add/:id', cartControllers.add);

// PUT route for removing one item from cart
router.put('/cart/lineitems/remove/:id', cartControllers.deleteOne);

// DELETE route for deleting all of specific lineitem from cart
router.delete('/cart/lineitems/delete-all/:id', cartControllers.deleteAll);

// DELETE specific order with status 'cart'
router.delete('/cart/delete/:id', orderControllers.deleteCart);


/*--------------------------- CHECKOUT endpoints -----------------------------*/

// Middleware der bruges for alle /checkout-routes, så de ikke kan tilgås hvis kurven er tom.
router.use('/checkout', auth.isLoggedIn, auth.cartNotEmpty);


/*------------  DELIVERY  ---------------*/
// GET route for delivery-page
router.get('/checkout/delivery-method',  deliveryMethodControllers.delivMethodPage );//auth.cartNotEmpty,

// POST route for delivery-method information
router.post('/checkout/delivery-method', deliveryMethodControllers.create);



/*---------- DELIVERY-ADDRESS ---------*/
// GET route for delivery-address page
// Middleware: Kun hvis bruger har valgt 'levering'. Ellers redirectes til 'payment'.
router.get('/checkout/delivery-address', auth.deliveryTrue, addressControllers.addressPage);

// POST route for delivery-address information
router.post('/checkout/delivery-address', addressControllers.create );

/*--------------PAYMENT----------------*/
// GET route for payment-page
// Middleware: Tjekker om bruger allerede har betalt for ordren før.
router.get('/checkout/payment', auth.checkPayment, paymentControllers.paymentPage);

// POST route for payment information
router.post('/checkout/payment', paymentControllers.create);


/*------------ ORDER ---------------*/
router.post('/checkout/order/:id', orderControllers.placeOrder);


/*--------------------------- ORDER endpoint -----------------------------*/
// GET specific order
router.get('/order/:id', auth.isLoggedIn, orderControllers.findOne);



// Eksporterer 'router' så den er tilgængelig i app.js
module.exports = router;
