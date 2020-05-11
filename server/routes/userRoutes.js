// Definerer router-objekt, som er en isoleret instans af middleware og routes.
const express = require('express');
const router = express.Router();


/*-----------------------------------Middleware----------------------------------------------*/
// Importerer middleware
const auth = require('../middleware/authentication');
const {
    signupValidationRules,
    signupValidate,
    loginValidationRules,
    loginValidate} = require('../middleware/user-validation.js');

/*-----------------------------------Controllers ---------------------------------------------*/

// USER
const userControllers = require('../controllers/userControllers');



/*-------------------------Endpoints og route-handlers---------------------------------------*/

/*------------- SIGNUP ------------------*/
// GET route for signup page
router.get('/signup', auth.isNotLoggedIn, userControllers.signupPage);


// POST route for user signup
router.post('/signup',signupValidationRules(), signupValidate, userControllers.signup);



/*------------- LOGIN ------------------*/
// GET route for login page
router.get('/login', auth.isNotLoggedIn, userControllers.loginPage);
// POST route for user login
router.post('/login', loginValidationRules(), loginValidate, userControllers.login);

/*------------- USER ACCOUNT  ---------------*/

// GET route for user account page
// Middleware: Tillader kun adgang hvis bruger er logget ind.
router.get('/account', auth.isLoggedIn, userControllers.account);

router.get('/account/:id', auth.isLoggedIn, userControllers.account);

/*------------- LOG OUT-------------------*/
// GET route for user logout
// Middleware: Bruger kan kun logge ud, hvis denne allerede er logget ind.
router.get('/logout', auth.isLoggedIn, userControllers.logout);

/*------------- DELETE USER ----------------*/
// DELETE route for deleting user
// Middleware: Bruger skal være logget ind.
router.delete('/delete/:id', auth.isLoggedIn, userControllers.deleteUser);



// Eksporterer 'router' så den er tilgængelig i app.js
module.exports = router;
