const Product = require('../models/Product');
const LineItem = require('../models/LineItem');


module.exports = (req, res)=> {
    let productId = req.params.id;
    let lineItems = new LineItem(req.session.lineItems ? req.session.lineItems: {});

    if (!req.session.lineItems) {
        req.flash('error','Kan ikke fjerne produkt. Du har ingen varer i kurven.')
        res.redirect('/products');
    } else {
        Product.findById(productId)
            .then(function(product) {
                // console.log(product);
                lineItems.remove(product, product.product_id, req.session.order.order_id);
                req.session.lineItems = lineItems;
                console.log( "Lineitem fjernet. Nuværende kurv; " );
                console.log(req.session.lineItems);
                res.redirect('/products');
            })
            .catch(function(err) {
                req.flash(err);
                console.log(err);
            })
    }


};