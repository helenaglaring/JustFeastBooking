//https://dev.to/nedsoft/a-clean-approach-to-using-express-validator-8go
const { check, validationResult } = require('express-validator');
const loginValidationRules = () => {
    return [
        check('email', 'Invalid email').isEmail(),
        check('email', 'Udfyld venlgist en E-mail').trim().not().isEmpty(),
        check('password', 'Indtast venligst et gyldigt password').trim().isLength({min:4}),
// End of post data validation
    ]
}

const loginValidate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    //onst extractedErrors = [];
    //errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));
    //req.flash('error', extractedErrors);
    let err_val_messages = errors.errors.map( (error) => {
        return error.msg;
    });
    req.flash('error', err_val_messages);

    // RENDERING loginpage with validation errors
    res.redirect('login');
};

module.exports = {
    loginValidationRules,
    loginValidate,
};
