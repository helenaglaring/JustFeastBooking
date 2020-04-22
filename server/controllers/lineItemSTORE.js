const Product = require('../models/Product');
const LineItem = require('../models/LineItem');


module.exports = (req, res)=> {
    let productId = req.params.id;
    let lineItems = new LineItem(req.session.lineItems ? req.session.lineItems: {});

    Product.findById(productId)
        .then(function(product) {
            lineItems.add(product, product.product_id, req.session.order.order_id);
            req.session.lineItems = lineItems;
            console.log( "Lineitem Tilføjet. Nuværende kurv; " );
            console.log(req.session.lineItems);
            res.redirect('/products');
        })
        .catch(function(err) {
            console.log(err);
        })
};