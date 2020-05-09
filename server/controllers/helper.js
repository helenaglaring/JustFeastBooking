// Kilde: https://www.codementor.io/@olawalealadeusi896/building-a-simple-api-with-nodejs-expressjs-postgresql-db-and-jwt-3-mke10c5c5


/*----------------------------------- HJÆLPEFUNKTION------------------------------------------------------*/
// Importerer jsonwebtoken  og sætter variabel 'secret' der skal bruges til at generere en secret jwt token.
const jwt = require('jsonwebtoken');
const secret = 'verysecret';

// Importerer bcrypt der bruges til at kryptere password inden det gemmes i db
const bcrypt = require('bcrypt');


module.exports = {
    // Hjælpefunktion til at generere jwt-token i userControllers. Skal sikre at user_id bliver kryptiseret inden
    // det gemmes i session.
    generateToken(id) {
        const token = jwt.sign({user_id: id}, secret
        );
        // Returnerer token så det kan tilgås
        return token;
    },

    /**
     * Hash Password Method
     * @param {string} password
     * @returns {string} returns hashed password
     * Building a simple API with Nodejs, Expressjs, PostgreSQL DB, and JWT - 3
     */
    hashPassword(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
        /*
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) throw err;
             else {
                return hash;
            }
        })*/
    },
    /**
     * comparePassword
     * @param {string} hashPassword
     * @param {string} password
     * @returns {Boolean} return True or False
     */

    comparePassword(password, hashPassword) {
        return bcrypt.compareSync(password, hashPassword);
        /*
        bcrypt.compare(hashPassword, password)
            .then(compareResult => {
                // Resolver hvis password matcher
                if (compareResult) {
                    console.log(true)
                    return true;
                } else {
                    console.log(false)
                    return false;
                }
            })
    }*/
    }
};