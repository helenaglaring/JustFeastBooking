/*----------------------------------- LINE ITEM CONTROLLERS ------------------------------------------------------*/
// Database-connection
const pool = require('../db/db');

// Importerer modeller
const Product = require('../models/Product');
const Cart = require('../models/LineItem');


module.exports = {

    // Tilføjer det valgte produkt til kundens lineItem, der fungerer som 'cart'/'kurv'
    add: (req, res) => {
        // Først deklareres id af det valgte produkt til en variabel. Dette id er blevet sendt via API (:id)
        let productId = req.params.id;

        // Deklarerer variabel 'oldCart' for req.session.lineItems. Bruger ternary expression til først at tjekke
        // om req.session.lineItems er true. Hvis denne er false og altså 'tom' sættes værdien til et tomt objekt.
        let oldCart = req.session.lineItems ? req.session.lineItems : {};

        // Instantierer et nyt Cart-objekt ud fra den eksisterende session.
        let cart = new Cart(oldCart.items, oldCart.totalQty, oldCart.totalPrice, oldCart.deliveryFee);

        // Henter specifikt produkt fra db ud fra produkt_id
        // Bruges til at knytte lineitems-product_id sammen med product_id.
        // sætte product-attributten til det valgte produkt-objekt.
        pool.query('SELECT * FROM product WHERE product_id = $1', [productId])
            .then(result => {
                // Instantierer nyt Product-objekt.
                let product = new Product(result.rows[0].product_id,result.rows[0].product_name,result.rows[0].product_price);
                // Bruger det instantierede Product-objekt til at tilføje et nyt lineitem til Cart.
                cart.add(product, product.productID);
                // Opdaterer værdien af lineItems i session til værdien af cart-objektet.
                req.session.lineItems = cart;
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
        let oldCart = req.session.lineItems ? req.session.lineItems : {};
        // Instantierer et nyt Cart-objekt ud fra den eksisterende session.
        let cart = new Cart(oldCart.items, oldCart.totalQty, oldCart.totalPrice, oldCart.deliveryFee);

        cart.deleteOne(productId);
        req.session.lineItems = cart;
        console.log( "Lineitem fjernet med productID: " );
        console.log(productId);

        res.redirect('/products');
    },

    // Funktion der sletter alle lineitems af den givne produkt-type som kunden har i sin 'kurv'.
    deleteAll: (req, res) => {
        let productId = req.params.id;
        let oldCart = req.session.lineItems ? req.session.lineItems : {};
        // Instantierer et nyt Cart-objekt ud fra den eksisterende session.
        let cart = new Cart(oldCart.items, oldCart.totalQty, oldCart.totalPrice, oldCart.deliveryFee);
        cart.deleteAll(productId);
        req.session.lineItems = cart;
        console.log( "Alle lineitems fjernet med productID: " );
        console.log(productId);
        res.redirect('/products');
    },

};
