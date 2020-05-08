/*----------------------------------- PRODUCT CONTROLLERS ------------------------------------------------------*/

// Database-connection
const pool = require('../db/db');

// Importerer modeller
const Product = require('../models/Product.js');
const Cart = require('../models/LineItem.js');

//-- Loader produkter fra database og viser dem på productPage --//
module.exports = {
    // GET route til at vise produkter i front-end.
    productPage: (req, res) => {
        // Instantierer nyt objekt der fungerer som vores 'cart'. Skal bruges til at vise nuværende kurv i front-end.
        // Bruger ternary expression for at deklarere værdien fra det allerede eksisterende 'cart' i session til oldCart.
        // Hvis ikke der allerede eksisterer et cart vil req.session.lineItems være 'false' og værdien sættes til et tomt objekt.
        let oldCart = req.session.lineItems ? req.session.lineItems : {};

        // Instantierer et nyt Cart-objekt ud fra den eksisterende lineItems i session.
        // Hvis oldCart var false instantieres attrubutternes værdier til {} eller 0 afhænigt af hvilke det er.
        let cart = new Cart(oldCart.items, oldCart.totalQty, oldCart.totalPrice, oldCart.deliveryFee);

        // Sætter variabel totalPrice der holder kurvens samlede pris.
        let totalPrice = cart.totalPrice ? cart.totalPrice : 0;
        console.log("Current cart items: ");
        console.log(req.session.lineItems);

        // Finder alle produkter i databasen
        pool.query('SELECT * FROM product')
            .then(result => {
                // Returnerer alle records i product-tabel. Bruger for loop til at instantiere et nyt Produkt-objekt for hvert produkt
                // i db og pusher det til product-Array for at de kan tilgås i productShow-siden.
                let products = [];
                for (let i = 0; i < result.rows.length; i++) {
                    products.push(new Product(result.rows[i].product_id, result.rows[i].product_name, result.rows[i].product_price,))
                }
                console.log("Alle Produkter i databasen: ");
                console.log(products);

                // Render siden der viser produkter
                res.render('productShow', {
                    title: 'Menu-cart',
                    products,
                    // Bruger Cart-klassens metode generateArray til at lave array for alle lineitems i kurv så de kan vises.
                    lineitems: cart.generateArray(),
                    totalPrice: totalPrice,
                    messages: {
                        success: req.flash('success'),
                        error: req.flash('error')
                    }
                })
            })
            .catch(err => {
                console.log(err);
                res.status(400).send(err);
            })
    }

};



/* GAMLE. Virkede med de funktioner i modellaget inden vi implementerede klasser,
//-- Loader produkter fra database og viser dem på productPage --//
module.exports = {

    productPage: (req, res) => {
        // Instantierer nyt objekt der fungerer som vores 'cart'. Skal bruges til at vise nuværende kurv i front-end.
        let lineItems = new LineItem(req.session.lineItems ? req.session.lineItems: {});
        // Sætter variabel totalPrice der holder kurvens samlede pris.
        let totalPrice = lineItems.totalPrice ? lineItems.totalPrice : 0;
        console.log("Current cart items: ");
        console.log(req.session.lineItems);

        // Finder alle produkter i databasen
        Product.findAll()
            .then(function (products) {
                // Responderer med siden der viser alle produkter i database, kundens nuværende kurv og samlede pris.
                res.render('productShow',{
                    title: 'Menu-cart',
                    products,
                    lineitems: lineItems.generateArray(),
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
    },

}
*/
