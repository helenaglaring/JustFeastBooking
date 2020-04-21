/*----------------------------------- Delivery ------------------------------------------------------*/


module.exports = (req,res) => {

    res.render('delivery', {
        title: 'Delivery-method page',
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    })
};