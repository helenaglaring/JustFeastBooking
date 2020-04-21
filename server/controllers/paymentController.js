
const Payment = require('../models/Payment.js');
const Order = require('../models/Order.js');

// POST route for payment
module.exports = (req, res) => {

    Payment.create(req.session.order.order_id, req.session.user.user_id, req.session.totalAmount)
        .then(result => {
            console.log(result);
            req.session.payment = result;
            console.log("Betaling bekrfætet:");
            console.log(req.session.payment);

        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Noget gik helt  galt');
            res.redirect('payment');
        });

    Order.placeOrder(req.session.order)
        .then(result => {
            console.log(result);
            req.flash('success', "Tak for din betaling");
            req.session.lineItems = {};
            res.redirect('/order/' + req.session.order.order_id);
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Noget gik galt');
            res.redirect('payment');
        });
}

