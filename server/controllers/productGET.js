const Product = require('../models/Product.js');
const LineItem = require('../models/LineItem.js');



//-- Loads products from database --//
module.exports = function(req, res) {
    let lineItems = new LineItem(req.session.lineItems ? req.session.lineItems: {});
    let totalPrice = lineItems.totalPrice ? lineItems.totalPrice : 0;
    console.log(req.session.lineItems);

    Product.findAll()
        .then(function (products) {
            console.log("TEST:");
            console.log(products);

            res.render('productShow',{
                title: 'Menu-cart',
                products,
                lineitems: lineItems.gennerateArray(),
                totalPrice: totalPrice,
                messages: {
                    success: req.flash('success'),
                    error: req.flash('error')
                }
            })
        })
        .catch(function (err) {
            console.log(err);
            res.status(400).send(err);
        })
}

