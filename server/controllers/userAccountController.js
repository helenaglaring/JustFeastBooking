

/*---------------------------------------------Account page call ------------------------------------------------------*/

// GET route for user account
module.exports = (req, res) => {

    //let userId = user.session.userID;
    res.render('user/account', {
        title: 'Account',
        user: req.session.user,
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    })
};
