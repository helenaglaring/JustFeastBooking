/*----------------------------------- DELIVERY METHOD CONTROLLERS ------------------------------------------------------*/
// Database-connection
const pool = require('../db/db');

// Importerer modeller
const DeliveryMethod = require('../models/DeliveryMethod.js');
const Cart = require('../models/LineItem');

module.exports = {
    // Delivery-method page call: GET route for delivery-method page
    delivMethodPage: (req, res) => {
        res.render('delivery', {
            title: 'Delivery-method page',
            order: req.session.order,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        })
    },

    // POST route for delivery-page
    create: (req, res) => {
        let orderID = req.session.order.orderID;
        // Assigner form values fra request til variable
        let {delivery, selectedTime} = req.body;
        // Konverterer 'delivery' til bool da det er den påkrævede data-type.
        delivery = (delivery === 'true');

        // Instantierer objekt af klassen DeliveryMethod med værdier fra req.
        let d = new DeliveryMethod(null, orderID, delivery, null, selectedTime);

        // Instantierer et nyt Cart-objekt ud fra den eksisterende session.
        let oldCart = req.session.lineItems ? req.session.lineItems : {};
        let cart = new Cart(oldCart.items, oldCart.totalQty, oldCart.totalPrice, oldCart.deliveryFee);

        //Indsætter oplysninger i 'delivery'-tabel.
        pool.query(`
                INSERT INTO delivery (order_id, delivery, delivery_time)
                VALUES ($1, $2,$3)
                ON CONFLICT (order_id)
                DO UPDATE SET delivery=$2, delivery_time=$3
                RETURNING *`
            , [orderID, d.deliveryIsTrue, d.deliveryTime])

            .then(result => {
                // Instaniterer nyt DeliveryMethod-objekt med med oplysninger der er indsat i tabellen.
                let newDelMethod = new DeliveryMethod(result.rows[0].delivery_id, result.rows[0].order_id, result.rows[0].delivery, result.rows[0].address_id, result.rows[0].delivery_time);
                // Gemmer det nye newDelMethod-obejkt i session så det kan tilgås senere
                req.session.delivery = newDelMethod;

                // If-else statement der tjekker om delivery-field er sand, og om kunde har valgt levering.
                if (newDelMethod.deliveryIsTrue) {
                    // Hvis true har kunde valgt levering.
                    console.log("'Levering' er registreret:");
                    console.log(req.session.delivery);
                    // Tilføjer leveringsgebyr ved at insantiere Cart-objekt og bruge addDeliveryFee-metoden.
                    cart.addDeliveryFee(newDelMethod.deliveryIsTrue);

                    // Gemmer det opdaterede cart i session så deliveryFee og totalPrice er opdateret.
                    req.session.lineItems = cart;
                    console.log(cart);

                    // Omdirigerer til leverings-addresse hvis kunde har valgt levering
                    req.flash('success', "Leveringsmetode registreret: Levering.");
                    res.redirect('/checkout/delivery-address')

                } else {
                    // Hvis delivery===false har kunde valgt afhentning. Intet leveringsgebyr.
                    // Omdirigeres direkte til payment-side.
                    cart.addDeliveryFee(newDelMethod.deliveryIsTrue);
                    // Opdaterer cart i session så deliveryFee og totalPrice er opdateret.
                    req.session.lineItems = cart;
                    console.log(cart);

                    console.log("Afhentning er valgt ");

                    req.flash('success', "Leveringsmetode registreret: Afhent selv din bestilling.");
                    res.redirect('/checkout/payment')
                }
            })
            .catch((err) => {
                console.log(err);
                req.flash('error', 'Noget gik galt');
                res.redirect('/checkout/delivery-method');
            });
    }
};



/* GAMLE. Virkede med de funktioner i modellaget inden vi implementerede klasser,
 create: (req, res) => {
            // Bruger create funktion fra DeliveryMethod-model til at gemme oplysninger i db.
            DeliveryMethod.create(req.body, req.session.order.order_id)
                .then(result => {
                    console.log(result);

                    // Opbevarer de oplysninger der er indsat i deliveryMethod-tabel i session
                    req.session.delivery = result;

                    // If-else statement der tjekker om delivery-field er sand, og om kunde har valgt levering.
                    if (result.delivery) {
                        // Hvis true har kunde valgt levering.
                        console.log("Levering er valgt ");
                        console.log("Levering registreret: ");
                        console.log(req.session.delivery);

                        // Tilføjer leveringsgebyr ved at insantiere Cart-objekt og bruge addDeliveryFee-metoden.
                        let cart = new Cart(req.session.lineItems ? req.session.lineItems: {});
                        cart.addDeliveryFee();

                        // Gemmer det opdaterede cart i session så deliveryFee og totalPrice er opdateret.
                        req.session.lineItems = cart;
                        console.log(cart);

                        // Omdirigerer til leverings-addresse hvis kunde har valgt levering
                        req.flash('success', "Leveringsmetode registreret: Levering.");
                        res.redirect('/checkout/delivery-address')

                    } else {
                        // Hvis delivery===false har kunde valgt afhentning. Intet leveringsgebyr.
                        // Omdirigeres direkte til payment-side.
                        console.log("Afhentning er valgt ");
                        req.flash('success', "Leveringsmetode registreret: Afhent selv din bestilling.");
                        res.redirect('/checkout/payment')
                    }
                })
                .catch((err) => {
                    console.log(err);
                    req.flash('error', 'Noget gik galt');
                    res.redirect('/checkout/delivery-method');
                });

        },
};*/


