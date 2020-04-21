

const Address = require('../models/Address.js');

// POST route for delivery-address
module.exports = (req, res) => {

    Address.create(req.body, req.session.user.user_id)
        .then(result => {
            console.log(result);
            req.session.deliveryAddress = result;
            req.flash('success', "Leveringsoplysninger er registreret");
            res.redirect('payment')
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Noget gik galt');
            res.redirect('delivery-address');
        });
};

