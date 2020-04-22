

const DeliveryMethod = require('../models/DeliveryMethod.js');

// POST route for delivery-page
module.exports = (req, res) => {

    DeliveryMethod.create(req.body, req.session.order.order_id)
        .then(result => {
            console.log(result);
            req.session.delivery = result;
            if (result.delivery) {
                console.log("Levering er valgt ");
                console.log("Levering registreret: ");
                console.log(req.session.delivery );
                req.flash('success', "Leveringsmetode registreret: Levering.");
                res.redirect('delivery-address')
            } else {
                console.log("Afhentning er valgt ");
                req.flash('success', "Leveringsmetode registreret: Afhent selv din bestilling.");
                res.redirect('payment')
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Noget gik galt');
            res.redirect('delivery-method');
        });
};
/*
router.post('/delivery-method',  function(req, res) {
    console.log("Delivery-method form requested: " + JSON.stringify(req.body));
    console.log("ORDER ID: " + req.session.order_id);
    let data = {
        order_id: req.session.order_id,
        delivery: req.body.delivery,
        delivery_time: req.body.selectedTime,
    };
    // Convert delivery to bool
    data.delivery = (data.delivery === 'true');
    console.log("delivery is converted to boolean expression: "+ data.delivery);

    pool.query(`
        INSERT INTO delivery (order_id, delivery, delivery_time)
        VALUES ($1, $2,$3)
        ON CONFLICT (order_id)
        DO UPDATE SET delivery=$2, delivery_time=$3
        RETURNING *`, [data.order_id, data.delivery, data.delivery_time])
        .then(result => {
            req.session.delivery = result;
            console.log("Levering registreret: ");
            console.log(req.session.delivery );
            res.redirect('delivery-address')
        })
        .catch((err) => {
            console.log(err)
        });

});*/