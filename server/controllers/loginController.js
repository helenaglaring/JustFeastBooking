//https://github.com/anthonynsimon/node-postgres-registration/blob/master/models/user.js

/*-----------------------------------Login page call ------------------------------------------------------*/
// GET route for user login
module.exports = (req, res) => {
    res.render('user/login', {
        title: 'Login',
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    });
};