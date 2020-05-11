/*----------------------------------- LINE ITEM CONTROLLERS ------------------------------------------------------*/
// Database-connection
const pool = require('../db/db');

// Importerer modeller
const Product = require('../models/Product');
const Cart = require('../models/Cart');


module.exports = {

    // Tilføjer det valgte produkt til kundens 'cart'/'kurv'
    add: (req, res) => {
        // Først deklareres id af det valgte produkt til en variabel. Dette id er blevet sendt via API (:id)
        let productId = req.params.id;
        let orderID = req.session.order.orderID;

        // Deklarerer variabel 'oldCart' for req.session.cart. Bruger ternary expression til først at tjekke
        // om req.session.cart er true. Hvis denne er false og altså 'tom' sættes værdien til et tomt objekt.
        let oldCart = req.session.cart ? req.session.cart : {};

        // Instantierer et nyt Cart-objekt ud fra den eksisterende session.
        let cart = new Cart(oldCart.items, oldCart.totalQty, oldCart.totalPrice, oldCart.deliveryFee, orderID);

        // Henter specifikt produkt fra db ud fra produkt_id
        // Bruges til at knytte lineitems-product_id sammen med product_id.
        // sætte product-attributten til det valgte produkt-objekt.
        pool.query('SELECT * FROM product WHERE product_id = $1', [productId])
            .then(result => {
                // Instantierer nyt Product-objekt.
                let product = new Product(result.rows[0].product_id,result.rows[0].product_name,result.rows[0].product_price);
                // Bruger det instantierede Product-objekt til at tilføje et nyt lineitem til Cart.
                cart.add(product, product.productID);
                // Opdaterer værdien af cart i session til værdien af cart-objektet.
                req.session.cart = cart;
                console.log( "Lineitem Tilføjet til kurv:" );
                console.log(product);
                res.redirect('/products');
            })
        .catch(err => {
            console.log(err);
        })
    },


    // Fjerner ét stk. af det lineItem af den valgte produkt-type.
    deleteOne: (req, res) => {
        let productId = req.params.id;
        let oldCart = req.session.cart ? req.session.cart : {};
        // Instantierer et nyt Cart-objekt ud fra den eksisterende session.
        let cart = new Cart(oldCart.items, oldCart.totalQty, oldCart.totalPrice, oldCart.deliveryFee, oldCart.orderID);

        cart.deleteOne(productId);

        console.log( "Lineitem fjernet med productID: " );
        console.log(productId);

        // Opdaterer cart i session
        req.session.cart = cart;
        res.redirect('/products');
    },

    // Funktion der sletter alle lineitems af den givne produkt-type som kunden har i sin 'kurv'.
    deleteAll: (req, res) => {
        let productId = req.params.id;
        let oldCart = req.session.cart ? req.session.cart : {};

        // Instantierer et nyt Cart-objekt ud fra den eksisterende session.
        let cart = new Cart(oldCart.items, oldCart.totalQty, oldCart.totalPrice, oldCart.deliveryFee, oldCart.orderID);

        // Bruger Cart-klassens deleteAll metode til at slette alle lineitems med givne produktID
        cart.deleteAll(productId);

        console.log( "Alle lineitems fjernet med productID: " );
        console.log(productId);
        req.session.cart = cart;

        res.redirect('/products');
    },

};
