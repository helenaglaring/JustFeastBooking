
const User = require('../models/User')
const jwt = require('jsonwebtoken');
const secret = 'verysecret';

// POST route for user login
module.exports = (req, res) => {
    User.authenticate(req.body)
        .then(function(result) {
            // Sætter user_id som JWT-token når bruger er logget ind
            const userID = result.id;
            const token = jwt.sign({ user_id: userID}, secret);
            res.cookie('jwt-token', token);
            // Gemmer logget ind user i session
            req.session.user = result.user;
            console.log("User-id obj:");
            console.log(req.session.user );
            console.log("User-id:");
            console.log(req.session.user.user_id );

            req.flash('success', `Du er nu logget ind.`);
            //res.send();
            res.redirect('account');
        })
        .catch(function(errors) {
            console.log(errors);
            req.flash('error', errors);
            // RENDERING loginpage with validation errors
            res.redirect('login');
        });
};
