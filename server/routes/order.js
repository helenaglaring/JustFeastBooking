const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const auth = require('../middleware/authentication');
const {check, validationResult} = require('express-validator');
const orderMiddle = require('../middleware/orderMiddleware');



/*----------------------------------- Order ------------------------------------------------------*/
// GET order-page
/*
router.get('/', auth.isLoggedIn, orderMiddle.currentAddressInfo, orderMiddle.calcDeliveryFee, orderMiddle.cartTotalAmount, function(req, res) {
    res.render('order', {
        title: 'Order',
        order: req.session.order,
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    })
});
*/


/*----------------------------------- Delivery ------------------------------------------------------*/

// GET route for delivery-page
/*
router.get('/delivery-method', orderMiddle.cartNotEmpty, function (req, res) {
    res.render('delivery', {
        title: 'Delivery-method page',
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }

    })
});
*/

// POST route for delivery-page
/*
router.post('/delivery-method',  function(req, res) {
    console.log("Delivery-method form requested: " + JSON.stringify(req.body));
    console.log("ORDER ID: " + req.session.order_id);
    let data = {
        order_id: req.session.order_id,
        delivery: req.body.delivery,
        delivery_time: req.body.selectedTime,
    };
    // Convert delivery to bool
    data.delivery = (data.delivery === 'true');
    console.log("delivery is converted to boolean expression: "+ data.delivery);

    pool.query(`
        INSERT INTO delivery (order_id, delivery, delivery_time)
        VALUES ($1, $2,$3)
        ON CONFLICT (order_id)
        DO UPDATE SET delivery=$2, delivery_time=$3
        RETURNING *`, [data.order_id, data.delivery, data.delivery_time])

        .then(result => {
            req.session.delivery = result.rows[0];
            //res.json(result.rows[0]);
            res.redirect('delivery-address')
        })
        .catch((err) => {
            console.log(err)
        });

    });

*/
/*----------------------------------- Address ------------------------------------------------------*/

// GET route for address-page
/* Flyttet
router.get('/delivery-address', orderMiddle.deliveryTrue, function (req, res) { //middle: ,
    res.render('delivery-address', {
        title: 'Delivery-address page',
        address: req.session.address,
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    })
});
*/


// POST route for delivery-address
/*Flyttet
router.post('/delivery-address',  function(req, res) {
    console.log(JSON.stringify(req.body));
    let data = {
        user_id: req.user.user_id,
        streetName: req.body.streetname,
        streetNumber: req.body.streetnumber,
        zipCode: req.body.zipcode,
        city: req.body.city,
    };
    console.log(data);

    pool.query(`
        INSERT INTO address (user_id, streetname, streetnumber, zipcode, city)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id)
        DO UPDATE SET streetname=$2, streetnumber=$3, zipcode=$4, city=$5
        RETURNING *`, [data.user_id, data.streetName, data.streetNumber, data.zipCode, data.city])

        .then(result => {
            req.session.deliveryAddress = result.rows[0];
            res.redirect('payment');

        })
        .catch((err) => {
            console.log(err)
        });
});
*/

/*----------------------------------- Payment ---------------------------------------------------
// GET route for payment-page
router.get('/payment', orderMiddle.calcDeliveryFee, orderMiddle.cartTotalAmount, orderMiddle.orderTotalAmount, function (req, res) {
    res.render('payment', {
        title: 'Payment',
        deliveryFee: req.session.deliveryFee,
        sumCartItems: req.session.sumCartItems,
        totalAmount: req.session.totalAmount,
        //cart: req.session.cart,
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    })
});---*/

/*
// POST route for payment
router.post('/payment', orderMiddle.checkPayment, function(req, res) {
    let data = {
        order_id: req.session.order_id,
        user_id: req.user.user_id,
        amount: req.session.totalAmount
    };
    pool.query(`
        INSERT INTO payment (order_id, user_id, amount)
        VALUES ($1, $2, $3)`
        , [data.order_id, data.user_id, data.amount])
        .then(result => {
            console.log(result.rows[0]);
            req.session.payment = result.rows[0];
            console.log("Betaling bekrfætet:");
            console.log(req.session.payment);
           // res.redirect('payment');
        })
        .catch((err) => {
            console.log(err)
        });

    //update order status from "cart" to "order"
    pool.query(`
        UPDATE "order"
        SET order_date=DEFAULT, status='order'
        WHERE order_id =$1
        RETURNING *
        `, [data.order_id])
        .then(result => {
            console.log("Order-status ændret fra 'cart' til 'ordre': ");
            console.log(result.rows[0]);
            req.flash('success', "Tak for din betaling");
            res.redirect('/order/' + req.session.order_id);
        })
        .catch((err) => {
            console.log(err)
        });
});

*/

/*----------------------------------- Order ------------------------------------------------------*/
// GET specific order
/*
router.get('/:id', function(req,res) {
    pool.query(`
        SELECT * FROM "order" WHERE order_id=$1
    `, [req.params.id])
        .then(result => {
            req.session.order = result.rows[0];
            console.log(req.session.order);
            res.render('order', {
                title: 'Order',
                order: req.session.order,
                messages: {
                    success: req.flash('success'),
                    error: req.flash('error')
                }
            })
        })
        .catch((err) => { console.log(err)});
});


module.exports = router;


// GET
/*
router.get('/:id', orderMiddle.cartEmpty, function (req, res) {
    res.render('delivery', {
        title: 'Delivery-method page',
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    })
});*/

