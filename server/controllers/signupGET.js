/*----------------------------------- Signup ------------------------------------------------------*/

module.exports = (req,res)=>{//auth.isNotLoggedIn,
    res.render('user/signup', {
        title: 'Signup page',
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    })
};

