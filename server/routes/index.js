
const express = require('express');
const router = express.Router();


/*-----------------------------------Import Middleware ------------------------------------------------*/
const auth = require('../middleware/authentication');
const { signupValidationRules, signupValidate } = require('../middleware/signupValidator.js');
const { loginValidationRules, loginValidate } = require('../middleware/loginValidator.js');
const cartMiddle = require('../middleware/cartMiddleware');
const orderMiddle = require('../middleware/orderMiddleware');
const orderDetailsMiddle = require('../middleware/orderDetailsMiddleware');

/*-------------------------------------------------------------------------------*/

// INDEX-PAGE
const homeController = require('../controllers/homeController');


// SIGNUP
const signupGET = require('../controllers/signupGET');
const signupController = require('../controllers/signupController');

// LOGIN
const loginController = require('../controllers/loginController');
const loginUserController = require('../controllers/loginUserController');

// LOGOUT
const logoutController = require('../controllers/logoutController');

// USER ACCOUNT
const userAccountController = require('../controllers/userAccountController');


// PRODUCTS
const productGET = require('../controllers/productGET');

// LINEITEM
const lineItemGET = require('../controllers/lineItemGET');
const lineItemSTORE = require('../controllers/lineItemSTORE');
const lineItemREMOVE = require('../controllers/lineItemREMOVE');


// ORDER
const checkoutController = require('../controllers/checkoutController');

// DELIVERY-METHOD
const deliveryMethodGET = require('../controllers/deliveryMethodGET');
const deliveryMethodController = require('../controllers/deliveryMethodController');

// DELIVERY-ADDRESS
const deliveryAddressGET = require('../controllers/deliveryAddressGET');
const deliveryAddressController = require('../controllers/deliveryAddressController');

// PAYMENT
const paymentGET = require('../controllers/paymentGET');
const paymentController = require('../controllers/paymentController');

// ORDER
const orderController = require('../controllers/orderGET');




/*----------------------------------- INDEX-PAGE ------------------------------------------------------*/
// GET home page
router.get('/', homeController);



/*----------------------------------- SIGNUP ------------------------------------------------------*/
//Router to Register page
router.get('/signup', auth.isNotLoggedIn, signupGET);

//Router to Register page
router.post('/signup',signupValidationRules(), signupValidate, signupController);

/*----------------------------------- LOGIN ------------------------------------------------------*/
//Router to Login page
router.get('/login', auth.isNotLoggedIn, loginController);
router.post('/login', loginValidationRules(), loginValidate, loginUserController);

/*----------------------------------- USER ACCOUNT ------------------------------------------------------*/

router.get('/account', auth.isLoggedIn, userAccountController);


/*-----------------------------------LOG OUT------------------------------------------------------*/

router.get('/logout', auth.isLoggedIn, logoutController);


/*----------------------------------- PRODUCTS -------------------------------------------------*/
// PRODUCTS:
// We try to show all products from the database.
router.get('/products',  auth.isLoggedIn, cartMiddle.createCart, productGET);//

/*-----------------------------------LINEITEMS ------------------------------------------------------*/
// LINEITEM:
// Now, we'll try to make a page for the individual product.
// We don't store the data in the database, so we make a GET-call instead of a STORE-call.
// We store the things on the cookie-session thingy
router.get('/lineitem/:id', lineItemSTORE);



router.get('/remove-lineitem/:id', lineItemREMOVE);

// Now, we access the controller to show all the lineItems when trying to access the route '/lineItems'
router.get('/lineItems',lineItemGET);


//router.get('/checkout', checkoutController);

/*----------------------------------- DELIVERY ------------------------------------------------------*/
// GET route for delivery-page
router.get('/delivery-method', orderDetailsMiddle.cartNotEmpty, deliveryMethodGET );

// POST route for delivery-page
router.post('/delivery-method',  deliveryMethodController);



/*----------------------------------- DELIEVRY-ADDRESS ------------------------------------------------------*/
// GET
router.get('/delivery-address', orderDetailsMiddle.deliveryTrue, /*orderDetailsMiddle.currentAddressInfo,*/ deliveryAddressGET);

// POST
router.post('/delivery-address', deliveryAddressController );



/*----------------------------------- PAYMENT ------------------------------------------------------*/

// GET route for payment-page
router.get('/payment', orderDetailsMiddle.calcDeliveryFee, orderMiddle.cartTotalAmount, orderMiddle.orderTotalAmount, paymentGET)


// POST route for payment
router.post('/payment', orderMiddle.checkPayment, paymentController);



/*----------------------------------- ORDER ------------------------------------------------------*/
// GET specific order

router.get('/order/:id', orderController);



module.exports = router;









/*----------------------------------- Index page call ----------------------------------------------------*
// GET route for index-page
router.get("/", auth.isLoggedIn, (req, res) => {

        pool.query('SELECT * FROM product', function (err, result) {
                if (err) {
                        console.log(err);
                        res.status(400).send(err);
                }
                res.render('index', {
                        title: 'Index',
                        data: result.rows,
                        messages: {
                                success: req.flash('success'),
                                error: req.flash('error')
                        }
                });
        });
});
--*/
