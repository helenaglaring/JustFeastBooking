//update order status from "cart" to "order"
/*
const Order = require('../models/Order.js');

module.exports = (req, res) => {
    Order.updateStatus(req.session.order)
        .then( (result) => {
            console.log(result);
            req.flash('success', "Checkout complete");
            res.redirect('products');

        })
        .catch( (err) => {
            console.log(err);
            req.flash('error', err);
            res.redirect('products');
        });
};
*/
