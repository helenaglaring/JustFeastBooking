/*----------------------------------- Address ------------------------------------------------------*/

// GET route for address-page
module.exports = (req,res) => {

    res.render('delivery-address', {
        title: 'Delivery-address page',
        address: req.session.address ? req.session.address : false ,
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    })
};



// GET route for address-page
/* Flyttet
router.get('/delivery-address', orderMiddle.deliveryTrue, function (req, res) { //middle: ,
    res.render('delivery-address', {
        title: 'Delivery-address page',
        address: req.session.address,
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    })
});
*/