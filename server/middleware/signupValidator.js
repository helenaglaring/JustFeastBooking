//https://dev.to/nedsoft/a-clean-approach-to-using-express-validator-8go
const { check, validationResult } = require('express-validator');
const signupValidationRules = () => {
    return [
        check('email', 'Invalid email').isEmail(),
        check('first_name', 'Udfyld venlgist "Fornavn" ').trim().not().isEmpty(),
        check('last_name', 'Udfyld venlgist "Efternavn"').trim().not().isEmpty(),
        check('email', 'Udfyld venlgist en E-mail').trim().not().isEmpty(),
        check('password', 'Password skal være på mindst 4 karakterer').trim().isLength({min:4}),
// End of post data validation
    ]
}

const signupValidate = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next()
    }

    let err_val_messages = errors.errors.map( (error) => {
        return error.msg;
    });
    req.flash('error', err_val_messages);

    // RENDERING loginpage with validation errors
    res.redirect('signup');
};

module.exports = {
    signupValidationRules,
    signupValidate,
};
