/*----------------------------------- PAYMENT CONTROLLERS ------------------------------------------------------*/
// Database-connection
const pool = require('../db/db');

// Importerer model
const Payment = require('../models/Payment.js');


module.exports = {
    // GET route for payment-page
    paymentPage: (req, res) => {
        res.render('payment', {
            title: 'Payment',
            cart: req.session.lineItems,
            order: req.session.order,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        })
    },

    // POST route for payment
    // Gemme betalingsoplysninger i db.
    create: (req, res) => {
        // Deklarerer variable der skal bruges til at instantiere nyt Payment-objekt.
        let userID = req.session.user.userID;
        let orderID = req.session.order.orderID;
        let totalAmount = req.session.lineItems.totalPrice;
        // Variable der assignes til værdierne fra req.body som er sendt via den submittede form.
        let {cardNumber, expiryDateMonth, expiryDateYear, CVC, cardHoldersName} = req.body;

        // Deklarerer nyt Payment-objekt
        let newPayment = new Payment(null, orderID, userID, cardNumber, expiryDateMonth, expiryDateYear, CVC, cardHoldersName, totalAmount);

        // Betaling oprettes ud fra order_id, user_id og totalAmount.
        pool.query(`INSERT INTO payment (order_id, user_id, amount) 
                    VALUES ($1, $2, $3) 
                    RETURNING *`, [newPayment.orderID, newPayment.userID, newPayment.totalAmount])
            .then(result => {
                // Returnerer den indsatte record.
                console.log(result.rows[0]);
                // Deklarerer det paymentID som blev indsat i db til newPayment-objektet så det nu indeholder alle oplysninger som bruger har gemt.
                newPayment.paymentID = result.rows[0].payment_id;
                console.log("Betaling bekrfætet:");
                console.log(newPayment);

                // Gemmer resultat i session så det kan tilgås senere
                req.session.payment = newPayment;

                // Redirecter til POST route der placerer ordre.
                res.redirect(307, '/checkout/order/' + orderID);
            })
            .catch(err => {
                console.log(err);
                // Redirect ved fejl
                req.flash('error', 'Noget gik helt  galt');
                res.redirect('/checkout/payment');
            });
    }

};





    /* GAMLE. Virkede med de funktioner i modellaget inden vi implementerede klasser,

            // Ændrer ordre-status fra 'cart' til 'order' når kunde bekræfter betaling.
            // Hvis betaling bekræftes succesfuldt ændres ordrens status fra 'cart' til 'order'

            // Opdaterer status til 'order' og sætter 'order_date' til DEFAULT.
            pool.query(`
                        UPDATE "order"
                        SET order_date=DEFAULT, status='order'
                        WHERE order_id =$1
                        RETURNING * `, [order.orderID])
                .then(result => {
                    let {order_id, user_id, order_date, status} = result.rows[0];
                    // Instantierer order-objekt med de værdier der er indsat i db
                    let newOrder = new Order(order_id, user_id, order_date, status);
                    // Returnerer den record der er blevet ændret i 'order'-tabellen.
                    console.log("Order-status ændret fra 'cart' til 'ordre': ");
                    console.log(newOrder);
                    req.session.order = newOrder;

                    // Deklarerer variabel 'oldCart' for req.session.lineItems. Bruger ternary expression til først at tjekke
                    // om req.session.lineItems er true. Hvis denne er false og altså 'tom' sættes værdien til et tomt objekt.
                    let oldCart = req.session.lineItems ? req.session.lineItems : {};

                    // Instantierer et nyt Cart-objekt ud fra den eksisterende session.
                    let cart = new Cart(oldCart.items, oldCart.totalQty, oldCart.totalPrice, oldCart.deliveryFee);
                    // Gemmer lineitems i database ved at bruge createOrder-metode.
                    cart.createOrder(order.orderID);

                    // Redirect til side der viser oplysninger fra specifik ordre ud fra order_id
                    req.flash('success', "Tak for din betaling");
                    req.session.lineItems = {};
                    res.redirect('/order/' + newOrder.orderID);
                })
                .catch((err) => {
                    console.log(err);
                    req.flash('error', 'Noget gik galt');
                    res.redirect('payment');
                });

            },
    */


    /* gemt
    // POST route for payment
    // Bruger createfunktionen fra Product-modellen til at gemme betalingsoplysninger i db.
    create: (req, res) => {
        // Betaling oprettes ud fra order_id, user_id og totalAmount.
        Payment.create(req.session.order.order_id, req.session.user.user_id, req.session.lineItems.totalPrice)
            .then(result => {
                console.log(result);
                // Gemmer resultat i session så det kan tilgås senere
                req.session.payment = result;
                console.log("Betaling bekrfætet:");
                console.log(req.session.payment);

            })
            .catch((err) => {
                console.log(err);
                // Redirect ved fejl
                req.flash('error', 'Noget gik helt  galt');
                res.redirect('/checkout/payment');
            });

        // Hvis betaling bekræftes succesfuldt bruges placeOrder funktion fra Order-model til at
        // ændre ordrens status fra 'cart' til 'order'
        Order.placeOrder(req.session.order)
            .then(order => {
                // Returnerer den record der er blevet ændret i 'order'-tabellen.
                console.log("Order-status ændret fra 'cart' til 'ordre': ");
                console.log(order);

                // Gemmer lineitems i database ved at bruge createOrder-funktion.
                let cart = new Cart(req.session.lineItems ? req.session.lineItems: {});
                cart.createOrder(order.order_id);

                // Redirect til side der viser oplysninger fra specifik ordre ud fra order_id
                req.flash('success', "Tak for din betaling");
                req.session.lineItems = {};
                res.redirect('/order/' + req.session.order.order_id);
            })
            .catch((err) => {
                console.log(err);
                req.flash('error', 'Noget gik galt');
                res.redirect('payment');
            });

     */



