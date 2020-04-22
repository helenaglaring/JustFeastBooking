const User = require('../models/User.js');
//const { userValidationRules, validate } = require('../middleware/signupValidator.js');

//app.post('/user', userValidationRules(), validate, (req, res) => {


module.exports = (req, res) => {
        User.create(req.body)
            .then(function(result) {
                console.log(result);
                req.flash('success', "Bruger oprettet");
                res.redirect('login');
            })
            .catch(function(errors) {
                req.flash('error', errors);
                res.redirect('signup');
            });
};



/*
router.post('/signup',
    // POST data validation, using express-validator
    [
        check('email', 'Invalid email').isEmail(),

         Promise checking if user already exists => moved further down.

        custom((value) =>{
            return pool.query(`SELECT email FROM "user" WHERE email=$1`,[value])
                .then(([rows]) => {
                    if(rows.length > 0) {
                        return Promise.reject('Email er allerede registreret');
                    }
                    return true;
                });
        }),
        check('first_name', 'Udfyld venlgist "Fornavn" ').trim().not().isEmpty(),
        check('last_name', 'Udfyld venlgist "Efternavn"').trim().not().isEmpty(),
        check('email', 'Udfyld venlgist en E-mail').trim().not().isEmpty(),
        check('password', 'Password skal være på mindst 4 karakterer').trim().isLength({min:4}),
        // End of post data validation
    ],
    async function(req, res) {
        const validation_result = validationResult(req);
        // IF validation_result has no ERROR
        if(validation_result.isEmpty())  {
            try {
                const client = await pool.connect();
                await client.query('BEGIN');
                let {first_name, last_name, password, email } = req.body;
                let hash_pwd = await bcrypt.hash(password, 12);
                await JSON.stringify(client.query(`
                    SELECT user_id 
                    FROM "user" 
                    WHERE "email"=$1`,
                    [email], function(err, result) {
                        if(result.rows[0]) {
                            req.flash('error', "E-mail er allerede registreret");
                            res.redirect('signup');
                        } else {
                            client.query(`
                                INSERT INTO "user" (first_name, last_name, _password, email)
                                VALUES ($1, $2, $3, $4)`,
                                [first_name, last_name, hash_pwd, email],
                                function(err, result) {
                                    if(err) {
                                        console.log(err);
                                    } else {
                                        client.query('COMMIT');
                                        console.log(result.rows);

                                    }
                                }
                            );
                        }
                    }
                ));
                client.release();
            }
            catch(e) {
                throw(e)
            }
        } else {
            // Collect validation errors
            let err_val_messages = validation_result.errors.map( (error) => {
                return error.msg;
            });
            req.flash('error', err_val_messages);

            // RENDERING loginpage with validation errors
            res.redirect('signup');
        }
    });
*/