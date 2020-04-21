/*----------------------------------- Middleware ------------------------------------------------------*/

const Address = require('../models/Address.js');
const DeliveryMethod = require('../models/DeliveryMethod.js');



/*---------Delivery-method middleware --------*/

//-- Middleware to GET delivery-method page, when user submits cart. Redirect if empty cart --//
exports.cartNotEmpty = function(req, res, next) {
    // Continue if there are line items in cart
    if(req.session.lineItems.totalQty===0) {
        console.log("TESTTT");
        console.log(req.session.lineItems.totalQty);
        // Redirect to cart index page if no items in cart
        req.flash('error', 'Du har ingen produkter i kurven');
        // res.redirect('products') // Redirect if not logged in
    } else {

        console.log("JUHU");
        console.log(req.session.lineItems.totalQty);
        return next();
    }
};



//-- Loads data if user already has stored address-information --//
// Only if delivery===true
exports.currentAddressInfo = function(req, res, next) {

        Address.findOne(req.session.user)
            .then(result => {
                console.log("Gemte addresseoplysninger:");
                console.log(result);
                req.session.address = result;
                next();
            })
            .catch(err => {
                console.log(err);
                req.session.address = false;
                next()
            });

};



/*---------Address middleware --------*/
//-- Middleware to GET address page. Only if user has selected "delivery"--//
exports.deliveryTrue = function(req, res, next) {
    // Hvis levering er valgt indlæses siden hvor leveringsoplysninger skal læses
    if(req.session.delivery.delivery) {
        return next();
    }
    // Hvis ikke bruger har valgt levering sendes direkte videre til betaling
    res.redirect('payment') // Redirect if not logged in

};


/*---------Delivery middleware --------*/
//-- ADD deliveryFee if delivery===true and total order --//
exports.calcDeliveryFee = function (req, res, next)  {
    req.session.deliveryFee = 0;
    DeliveryMethod.findOne(req.session.order)
        .then(result => {
            if (result === true) {
                req.session.deliveryFee = 45;
                console.log("Levering: " + req.session.delivery.delivery);
                console.log("Leveringsgebyr: " + req.session.deliveryFee);
                next()
            } else {
                req.session.deliveryFee = 0;
                console.log("Levering: " + req.session.delivery.delivery);
                console.log("Leveringsgebyr: " + req.session.deliveryFee);
                next()
            }
        })
        .catch(err => {
            console.log(err);
        });
};

//-- ADD deliveryFee if delivery===true and total order --//
/* Gammel:
exports.calcDeliveryFee = function (req, res, next)  {
    req.session.deliveryFee = 0;
    if (req.session.delivery.delivery === true) {
        req.session.deliveryFee = 45 ;
        next()
    } else {
        req.session.deliveryFee = 0 ;
        next()
    }
    console.log("Levering: " + req.session.delivery.delivery);
    console.log("Leveringsgebyr: " + req.session.deliveryFee);

};
*/



