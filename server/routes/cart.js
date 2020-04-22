/*
const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const auth = require('../middleware/authentication');
const cartMiddle = require('../middleware/cartMiddleware');
const orderMiddle = require('../middleware/orderMiddleware');
*/
// PRODUCTS:
//const productGET = require('../controllers/productGET');

// LINEITEM:
//const lineItemSTORE = require('../controllers/lineItemSTORE');
//const lineItemGET = require('../controller/lineItemGET');


/*----------------------------------- Index page call ------------------------------------------------------
// GET route for cart-page

// PRODUCTS:
// We try to show all products from the database.
router.get('/testing', productGET);


// LINEITEM:
// Now, we'll try to make a page for the individual product.
// We don't store the data in the database, so we make a GET-call instead of a STORE-call.
// We store the things on the cookie-session thingy
router.get('/lineItem/:id', lineItemSTORE);*/

/*
router.get("/", auth.isLoggedIn, cartMiddle.createCart, cartMiddle.products, cartMiddle.currentCart, orderMiddle.cartTotalAmount, orderMiddle.orderTotalAmount,
    (req, res) => {
        res.render('index', {
            title: 'Index',
            data: req.session.products ,
            cart: req.session.cart,
            cartTotalAmount: req.session.sumCartItems,
            cartTotal: req.session.totalAmount,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
});

*/
/* TEST route  => returns selected product
router.get('/add-item/:id', (req, res) => {
    pool.query('SELECT product_name FROM product WHERE product_id = $1', [req.params.id])
        .then(result => {
            res.json(result.rows);
            console.log(result.rows[0]);
            //res.redirect('/');
           //res.json(result.rows[0]);
        })
        .catch((err) => {
            throw err
        });
});
*/
/* POST route for ADDING item to cart
router.post('/add-item', function(req, res) {
//flyttet
    let data = {
        product: req.body.product_id,
        price: req.body.lineitem_price,
        //count: parseInt(req.body.count, 10)
    }
    pool.query(`
        INSERT INTO lineitem (product_id, order_id, qty, lineitem_price)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (product_id, order_id)
        DO UPDATE SET qty = lineitem.qty + 1
        RETURNING *
    `, [data.product, req.session.order.order_id, 1, data.price])
        .then(result => {
            //res.json(result.rows[0]);
            console.log(result.rows[0]);
            res.redirect('/cart');
        });
});
*/

//router.get('/lineItem/:id', lineItemSTORE);




/* PUT route for REMOVING item from cart */
/*
router.post('/remove-item/:id', function(req, res) {
    let data = {
        product: req.body.product_id,
        price: req.body.lineitem_price
    }
    pool.query(`
        SELECT * FROM lineitem WHERE product_id=$1 AND order_id=$2
    `, [req.params.id, req.session.order.order_id])
        .then(result => {
            console.log("Nuværende: " + result.rows[0]);
            // Tjekker om nuværende ordre indeholder dette produkt
            if (result.rows[0]) {
                // Tjekker om antal er større end 0
                if (result.rows[0].qty > 1) {
                    console.log(result.rows[0].qty);
                    // Query der decrementer antal med 1
                    pool.query(`UPDATE lineitem SET qty = lineitem.qty - 1 WHERE product_id=$1 AND order_id=$2 RETURNING *`, [data.product, req.session.order.order_id])
                        .then(result => {
                            console.log("Et produkt fjernet");
                            //res.json(result.rows[0]);
                            console.log(result.rows);
                            res.redirect('/cart');
                        })
                        .catch((err) => console.log(err))
                } else {
                    console.log("0 produkter af dette produkt");
                    // Query der sætter antal til 0, så man ikke kan komme i minus
                    pool.query(`DELETE FROM lineitem WHERE product_id=$1 AND order_id=$2 RETURNING *`, [data.product, req.session.order.order_id])
                        .then(result => {
                            console.log("Der er ikke flere af disse produkter i kurven ");
                           // res.json(result.rows[0]);
                            console.log(req.session.cart);
                            req.flash('error', 'Du kan ikke fjerne et produkt der ikke er i kurven');
                            res.redirect('/cart');
                        })
                        .catch((err) => console.log(err))
                }
             // Falsk hvis der ikke er en ordre med dette produkt
            } else {
                req.flash('error', 'Du kan ikke fjerne et produkt der ikke er i kurven');
                console.log("Produkt er ikke tilføjet til kurven - derfor kan det ikke fjernes");
                res.redirect('/cart');
            }
        });
});

// GET specific cart, return all items in cart
router.get('/:id', (req, res) => {
    console.log("nuværende ordre-ID:" + req.session.order_id);
    pool.query('SELECT * FROM lineitem WHERE order_id = $1', [req.params.id])
        .then(result => {
            //res.json(result.rows);
            req.session.cart = result.rows;
            console.log(req.session.cart);
            res.json({
                products: req.session.cart
            });
        })
        .catch((err) => {
            throw err
        });
});



module.exports = router;
*/
