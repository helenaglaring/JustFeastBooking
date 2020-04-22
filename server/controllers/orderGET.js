
const Payment = require('../models/Payment.js');
const Order = require('../models/Order.js');

/*----------------------------------- Order ------------------------------------------------------*/
// GET specific order
module.exports = (req, res) => {
    Order.findOne(req.params.id)
        .then(order => {
            req.session.order = order;
            console.log(req.session.order);

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
                console.log(err)
            }
        );
};
