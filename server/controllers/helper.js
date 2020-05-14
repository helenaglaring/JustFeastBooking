
/*----------------------------------- HJÆLPEFUNKTION------------------------------------------------------*/
// Importerer jsonwebtoken  og sætter variabel 'secret' der skal bruges til at generere en secret jwt token.
const jwt = require('jsonwebtoken');
const secret = 'verysecret';

// Importerer bcrypt der bruges til at kryptere password inden det gemmes i db
const bcrypt = require('bcrypt');


module.exports = {
    // Hjælpefunktion til at generere jwt-token i userControllers. Skal sikre at user_id bliver krypteret inden
    // det gemmes i session.
    generateToken(id) {
        const token = jwt.sign({user_id: id}, secret
        );
        // Returnerer token
        return token;
    },

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
    comparePassword(password, hashPassword) {
        return bcrypt.compareSync(password, hashPassword);
        /*
        bcrypt.compare(hashPassword, password)
            .then(compareResult => {
                // return true hvis password matcher
                if (compareResult) {
                    console.log(true)
                    return true;
                } else {
                // return false hvis password ikke matcher
                    console.log(false)
                    return false;
                }
            })
    }*/
    }
};


// Kilde:
// https://www.codementor.io/@olawalealadeusi896/building-a-simple-api-with-nodejs-expressjs-postgresql-db-and-jwt-3-mke10c5c5

