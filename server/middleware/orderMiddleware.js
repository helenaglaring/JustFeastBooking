
const pool = require('../db/db');
const Payment = require('../models/Payment.js');
/*----------------------------------- Middleware ------------------------------------------------------*/


/*---------Payment middleware --------*/

//-- Calculate total amount of lineitems in cart --//
exports.cartTotalAmount = function(req, res, next) {
    req.session.sumCartItems = 0;
    console.log(req.session.lineItems.totalQty);
    if(req.session.lineItems.totalQty>0) {
        pool.query(`
            SELECT SUM(qty * lineitem_price) as "Total"
            FROM lineitem
            WHERE order_id=$1`, [req.session.order.order_id])
            .then(result => {
                req.session.sumCartItems = Number(result.rows[0]["Total"]);
                console.log("Total pris for lineitems i kurv: " + req.session.sumCartItems);
                next()
            });
    // If false there is no cart and quantity is set to 0.
    } else {
        req.session.sumCartItems = 0;
        next()
    }
};

//-- Calculate total amount cart --//
exports.orderTotalAmount = function(req, res, next) {
    // SUM og lineitems and deliveryFee
    req.session.totalAmount = req.session.sumCartItems +  req.session.deliveryFee;

    console.log("Total sum af ordre: " + req.session.totalAmount  );
    next();
};



//-- Checking if payment already has been made --//
exports.checkPayment = function (req, res, next)  {
    Payment.findOne(req.session.order)
        .then(payment => {
            // Check if payment already has been made
            if (payment.isTrue === true) {
                req.flash('error', 'Du har allerede betalt');
                res.redirect('/order/' + req.session.order.order_id);
            }
            // Continue if no payment has been bade yet
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







