
/*----------------------------------- Payment ------------------------------------------------------*/
// GET route for payment-page

module.exports = (req,res) => {
    res.render('payment', {
        title: 'Payment',
        deliveryFee: req.session.deliveryFee,
        sumCartItems: req.session.sumCartItems,
        totalAmount: req.session.totalAmount,
        //cart: req.session.cart,
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    })
};


