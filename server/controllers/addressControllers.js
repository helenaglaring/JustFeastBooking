/*----------------------------------- ADDRESS CONTROLLERS ------------------------------------------------------*/
// Database-connection
const pool = require('../db/db');

// Importerer modeller
const Address = require('../models/Address.js');
const DeliveryMethod = require('../models/DeliveryMethod.js');

module.exports = {
    // GET route for address-page
    addressPage: (req, res) => {
        // Responderer med siden hvor kunde skal angive leveringsaddresseinformationer
        res.render('delivery-address', {
            title: 'Delivery-address page',
            order: req.session.order,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        })
    },

    // POST route for delivery-address
    create: (req, res) => {
        let deliveryID =  req.session.delivery.deliveryID;
        let {streetname, streetnumber, zipcode, city} = req.body;
        insertOne(req.body, deliveryID)
            .then(result => {
                // Returnere den indsatte række med addresse-oplysninger.
                let {address_id, delivery_id, streetname, streetnumber, zipcode, city } = result.rows[0];
                let deliveryAddress = new Address(address_id, delivery_id, streetname, streetnumber, zipcode, city );

                // Indsætter address_id i delivery-tabel for den respektive record for nuværende order_id
                pool.query(`
                        UPDATE delivery
                        SET address_id = 
                        (
                            SELECT address_id 
                            FROM address 
                            WHERE delivery.delivery_id = address.delivery_id
                        )
                        WHERE delivery_id=$1 RETURNING * 
                        `, [deliveryAddress.deliveryID])
                    .then(result => {
                        console.log(result.rows[0]);
                        // Instaniterer nyt DeliveryMethod-objekt med med oplysninger der er indsat i tabellen.
                        let updateDelMethod = new DeliveryMethod(result.rows[0].delivery_id, result.rows[0].order_id, result.rows[0].delivery, result.rows[0].address_id, result.rows[0].delivery_time);
                        // Gemmer det nye newDelMethod-obejkt i session så det kan tilgås senere
                        console.log("Levering er opdateret med address_id:  ");
                        console.log(updateDelMethod);

                        console.log("Leveringsoplysninger er registreret: ");
                        console.log(deliveryAddress);

                        // Opbevarer de indsatte addresseoplysninger og opdaterede deliveryMethod-objekt i session
                        req.session.delivery = updateDelMethod;
                        req.session.deliveryAddress = deliveryAddress;

                        req.flash('success', "Leveringsoplysninger er registreret");
                        res.redirect('/checkout/payment')
                    })
                    .catch(err => {
                        console.log(err);
                        res.redirect('/checkout/delivery-address');
                    })
            })
            .catch((err) => {
                // Omdirigerer ved fejl
                console.log(err);
                req.flash('error', 'Noget gik galt');
                res.redirect('/checkout/delivery-address');
            });
    },
};


// Hjælpefunktion der indsætter leveringsaddresse i database.
// Addresse-objekt og delivery_id som argumenter
function insertOne(data, delivery_id) {
    return new Promise((resolve, reject) => {
        pool.query(`
                INSERT INTO address (delivery_id, streetname, streetnumber, zipcode, city)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (delivery_id)
                DO UPDATE SET streetname=$2, streetnumber=$3, zipcode=$4, city=$5
                RETURNING *`
            , [delivery_id, data.streetname, data.streetnumber, data.zipcode, data.city])
            .then(result => {
                // Returnere den indsatte række med addresse-oplysninger.
                resolve(result);
            })
            .catch((err) => {
                reject('Noget gik galt');
                console.log(err)
            });
    });
}





/* GAMLE. Virkede med de funktioner i modellaget inden vi implementerede klasser,
// POST route for delivery-address
create: (req, res) => {
    let deliveryID =  req.session.delivery.deliveryID;
    let {streetname, streetnumber, zipcode, city} = req.body;

    // Gemmer addresse-oplysninger i db som bruger har indtastet i form.
    pool.query(`
            INSERT INTO address (delivery_id, streetname, streetnumber, zipcode, city)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (delivery_id)
            DO UPDATE SET streetname=$2, streetnumber=$3, zipcode=$4, city=$5
            RETURNING *`
        , [deliveryID, streetname, streetnumber, zipcode, city])
        .then(result => {
            // Returnere den indsatte række med addresse-oplysninger.
            let {address_id, delivery_id, streetname, streetnumber, zipcode, city } = result.rows[0];
            let deliveryAddress = new Address(address_id, delivery_id, streetname, streetnumber, zipcode, city );

            // Indsætter address_id i delivery-tabel for den respektive record for nuværende order_id
            pool.query(`
                    UPDATE delivery
                    SET address_id =
                    (
                        SELECT address_id
                        FROM address
                        WHERE delivery.delivery_id = address.delivery_id
                    )
                    WHERE delivery_id=$1 RETURNING *
                    `, [deliveryAddress.deliveryID])
                .then(result => {
                    console.log(result.rows[0]);
                    // Instaniterer nyt DeliveryMethod-objekt med med oplysninger der er indsat i tabellen.
                    let updateDelMethod = new DeliveryMethod(result.rows[0].delivery_id, result.rows[0].order_id, result.rows[0].delivery, result.rows[0].address_id, result.rows[0].delivery_time);
                    // Gemmer det nye newDelMethod-obejkt i session så det kan tilgås senere
                    console.log("Levering er opdateret med address_id:  ");
                    console.log(updateDelMethod);

                    console.log("Leveringsoplysninger er registreret: ");
                    console.log(deliveryAddress);

                    // Opbevarer de indsatte addresseoplysninger og opdaterede deliveryMethod-objekt i session
                    req.session.delivery = updateDelMethod;
                    req.session.deliveryAddress = deliveryAddress;

                    req.flash('success', "Leveringsoplysninger er registreret");
                    res.redirect('/checkout/payment')
                })
                .catch(err => {
                    console.log(err);
                    req.flash('error', 'Noget gik galt');
                    res.redirect('/checkout/delivery-address');
                })
        })
        .catch((err) => {
            // Omdirigerer ved fejl
            console.log(err);
            req.flash('error', 'Noget gik galt');
            res.redirect('/checkout/delivery-address');
        });
},
};
*/

/*
GAMMEL
Address.create(req.body, req.session.delivery.delivery_id)
    .then(result => {
        console.log("Leveringsoplysninger er registreret: ");
        console.log(result);

        // Opbevarer de indsatte addresseoplysninger i session
        req.session.deliveryAddress = result;
        req.flash('success', "Leveringsoplysninger er registreret");
        res.redirect('/checkout/payment')
    })
    .catch((err) => {
        // Omdirigerer ved fejl
        console.log(err);
        req.flash('error', 'Noget gik galt');
        res.redirect('/checkout/delivery-address');
    });
*/



