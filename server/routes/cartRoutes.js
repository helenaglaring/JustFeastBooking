// Definerer router-objekt, som er en isoleret instans af middleware og routes.
const express = require('express');
const router = express.Router();


/*-----------------------------------Middleware----------------------------------------------*/
// Importerer middleware
const auth = require('../middleware/authentication');


/*-----------------------------------Controllers ---------------------------------------------*/

// LINEITEM
const cartControllers = require('../controllers/cartControllers');

// ORDER
const orderControllers = require('../controllers/orderControllers');


/*-------------------------Endpoints og route-handlers---------------------------------------*/

/*------------- CART endpoints ------------------*/

// Middleware der gælder for alle /cart routes, der sikrer at bruger er logget ind.
router.use(auth.isLoggedIn);

// PUT route for adding item to cart
router.put('/lineitems/add/:id', cartControllers.add);
// PUT route for removing one item from cart
router.put('/lineitems/remove/:id', cartControllers.deleteOne);
// DELETE route for deleting all of specific lineitem from cart
router.delete('/lineitems/delete-all/:id', cartControllers.deleteAll);

// DELETE specific order with status 'cart'
router.delete('/delete/:id', orderControllers.deleteCart);



// Eksporterer 'router' så den er tilgængelig i app.js
module.exports = router;
