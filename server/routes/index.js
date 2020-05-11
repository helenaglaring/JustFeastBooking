// Definerer router-objekt, som er en isoleret instans af middleware og routes.
const express = require('express');
const router = express.Router();


/*-----------------------------------Middleware----------------------------------------------*/
// Importerer middleware
const auth = require('../middleware/authentication');


/*-----------------------------------Controllers ---------------------------------------------*/
// Importerer alle controllers

const homeController = require('../controllers/homeController');

// PRODUCTS
const productControllers = require('../controllers/productControllers');

// ORDER
const orderControllers = require('../controllers/orderControllers');


/*-------------------------Endpoints og route-handlers---------------------------------------*/



/*----------------------------------- INDEX-PAGE -------------------------------------------------*/
// GET index page
router.get('/', homeController);


/*----------------------------------- PRODUCTS -------------------------------------------------*/
// GET route for products page.
// Viser alle produkter fra databasen.
router.get('/products',  auth.isLoggedIn, auth.createCart, productControllers.productPage);//


/*----------------------------------- ORDER ------------------------------------------------------*/
// GET specific order
router.get('/order/:id', auth.isLoggedIn, orderControllers.findOne);



// Eksporterer 'router' så den er tilgængelig i app.js
module.exports = router;
