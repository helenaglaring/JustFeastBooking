/*----------------------------------- ORDER CONTROLLERS ------------------------------------------------------*/
// Database-connection
const pool = require('../db/db');

// Importerer modeller
const Cart = require('../models/LineItem');
const Order = require('../models/Order.js');


// GET specific order
module.exports = {

    // GET order ud fra orderID i params :id.
    // Funktion der henter specifik ordre fra db ud fra order_id. Bruges til at vise ordre-bekræftelse når kunde har gennemført betaling.
    findOne: (req, res) => {
        let orderID = req.params.id;
        // Finder specifik ordre i db ud fra parameter givet i URL params der består af order_id.
        pool.query(`
                SELECT 
                    "order".order_id, "order".user_id, "order".status, "order".order_date, 
                    payment.order_id, payment.amount, 
                    "user".user_id, "user".first_name, "user".email
                FROM "order"
                    INNER JOIN payment ON "order".order_id = payment.order_id
                    INNER JOIN "user" ON "order".user_id = "user".user_id
                WHERE "order".order_id = $1`, [orderID])
            .then(result => {
                    if (result.rows[0]) {
                    let {order_id, user_id, order_date, status, amount, first_name, email} = result.rows[0];

                    // Instantierer order-objekt med de værdier der er indsat i db
                    let newOrder = new Order(order_id, user_id, order_date, status,amount, first_name, email);
                    console.log("Ordre er blevet gemt: ");
                    console.log(newOrder);
                    // Opdaterer order i session til den opdaterede order der blev ændret i db.
                    req.session.order = newOrder;

                    // Ingen record med det givne order_id
                } else {
                    req.flash('error', 'Ingen ordre fundet');
                    console.log("Ingen ordre med givne ordreID");
                }
                // Responderer med ordre-side der viser oplysninger fra den givne ordre.
                res.render('order', {
                    title: 'Order',
                    order: req.session.order,
                    messages: {
                        success: req.flash('success'),
                        error: req.flash('error')
                    }
                })
            })
            .catch((err) => {
                    req.flash('error', err);
                    res.redirect('/');
                    console.log(err)
                }
            );
    },


    // DELETE metode. Funktion der sletter kundens nuværende kurv. HTTP-request sendes via FETCH fra front end
    // Sletter en order-record i databasen med status='cart' og det aktuelle order_id.
    // Bruges når kunde ønsker at slette sin kurv eller når bruger logger ud uden at have bestilt.
    deleteCart: (req, res) => {
        let cartID = req.params.id;
        // Bruger funktionen delteOne fra Order-model. Parameteren er sendt som :id og er det nuværende order_id.
        pool.query(`
                DELETE FROM "order"
                WHERE order_id=$1 AND status='cart'`, [cartID])
            .then( result => {
                // Nulstiller order og lineItems i session da cart=order skal slettes.
                req.session.order = {};
                req.session.lineItems = {};
                req.flash('succes', 'Nuværende kurv er slettet: ');
                console.log(result);
                console.log("Nuværende kurv er slettet");

                // Fetch i frontend omdirigerer til homepage
                res.end();

            })
            .catch(err => {
                console.log(err)
            })
    },


    // Hvis betaling bekræftes succesfuldt af kunde ændres ordrens status fra 'cart' til 'order'
    placeOrder: (req, res) => {
        // ID for den specifikke ordre
        let orderID = req.params.id;

        // Opdaterer status til 'order' og sætter 'order_date' til DEFAULT som sætter timestamp for hvornår ordre er lagt.
        pool.query(` UPDATE "order" SET order_date=DEFAULT, status='order' WHERE order_id =$1 RETURNING * `, [orderID])
            .then(result => {
                let {order_id, user_id, order_date, status} = result.rows[0];

                // Instantierer order-objekt med de værdier der er indsat i db
                let newOrder = new Order(order_id, user_id, order_date, status);
                // Returnerer den record der er blevet ændret i 'order'-tabellen.

                console.log("Order-status ændret fra 'cart' til 'ordre': ");
                console.log(newOrder);

                // Gemmer det opdaterede Order-objekt i session
                req.session.order = newOrder;

                // Deklarerer variabel 'oldCart' for req.session.lineItems. Bruger ternary expression til først at tjekke
                // om req.session.lineItems er true. Hvis denne er false og altså 'tom' sættes værdien til et tomt objekt.
                let oldCart = req.session.lineItems ? req.session.lineItems : {};

                // Instantierer et nyt Cart-objekt ud fra den eksisterende session.
                let cart = new Cart(oldCart.items, oldCart.totalQty, oldCart.totalPrice, oldCart.deliveryFee);

                // Gemmer lineitems i database ved at bruge createOrder-metode.
                cart.createOrder(orderID);

                // Redirect til side der viser oplysninger fra specifik ordre ud fra order_id
                req.flash('success', "Tak for din bestilling");

                // Nulstiller lineItems da ordrens status er ændret fra 'cart' til 'order'
                req.session.lineItems = {};

                // Redirect til route der henter den ordre der lige er blevet lagt.
                res.redirect('/order/' + newOrder.orderID);
            })
            .catch((err) => {
                console.log(err);
                req.flash('error', 'Noget gik galt');
                res.redirect('/payment');
            });
    },

};



/* GAMLE. Virkede med de funktioner i modellaget inden vi implementerede klasser,
 // Nyeste uden inner joins
// GET order ud fra orderID i params :id.
// Funktion der henter specifik ordre fra db ud fra order_id. Bruges til at vise ordre-bekræftelse når kunde har gennemført betaling.
findOne: (req, res) => {
   let orderID = req.params.id;
   // Finder specifik ordre i db ud fra parameter givet i URL params der består af order_id.
   pool.query('SELECT * FROM "order" WHERE order_id = $1', [orderID])
       .then(result =>{
           if (result.rows[0]) {
               let {order_id, user_id, order_date, status} = result.rows[0];
               let newOrder = new Order(order_id, user_id, order_date, status);
               console.log("Ordre: ");
               console.log(newOrder);
               // Opdaterer order i session til den opdaterede order der blev ændret i db.
               req.session.order = newOrder;

               // Ingen record med det givne order_id
           } else {
                   req.flash('error', 'Ingen ordre fundet');
                   console.log("Ingen ordre med givne ordreID");
           }
           // Responderer med ordre-side der viser oplysninger fra den givne ordre.
           res.render('order', {
               title: 'Order',
               order: req.session.order,
               messages: {
                   success: req.flash('success'),
                   error: req.flash('error')
                   }
               })
       })
       .catch((err) => {
               req.flash('error', err);
               res.redirect('/');
               console.log(err)
           }
       );
},*/





// Returnerer den record der er blevet ændret i 'order'-tabellen.
/* GAMMEL
// GET specific order
module.exports = {

    // Finder specifik ordre i db ud fra parameter givet i URL der består af order_id.
    findOne: (req, res) => {
        Order.findOne(req.params.id)
            .then(order => {
                // Opdaterer order i session til den opdaterede order der blev ændret i db.
                req.session.order = order;
                console.log(req.session.order);

                // Responderer med ordre-side der viser oplysninger fra den givne ordre.
                res.render('order', {
                    title: 'Order',
                    order: req.session.order,
                    messages: {
                        success: req.flash('success'),
                        error: req.flash('error')
                    }
                })
            })
            .catch((err) => {
                req.flash('error', err);
                res.redirect('/');
                console.log(err)
                }
            );
    },

    // DELETE metode. Funktion der sletter kundens nuværende kurv. HTTP-request sendes via FETCH fra front end
    deleteCart: (req, res) => {
        // Bruger funktionen delteOne fra Order-model. Parameteren er sendt som :id og er det nuværende order_id.
        Order.deleteOne(req.params.id)
            . then( result => {
                // Nulstiller order og lineItems i session da cart=order skal slettes.
                req.session.order = {};
                req.session.lineItems = {};
                req.flash('succes', 'Nuværende kurv er slettet: ');
                console.log(result);
                console.log("Nuværende kurv er slettet");

                // Fetch i frontend omdirigerer til homepage
                res.end();
            })
            .catch(err => {
            console.log(err)
        })
    }
};

*/

