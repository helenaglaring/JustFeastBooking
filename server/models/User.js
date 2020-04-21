/*
JWT: https://github.com/timtamimi/node.js-passport.js-template/blob/master/lib/routes.js
https://www.js-tutorials.com/nodejs-tutorial/user-authentication-using-jwt-json-web-token-node-js/#

Model:
https://github.com/anthonynsimon/node-postgres-registration/blob/master/models/user.js
 */

const pool = require('../db/db');
const bcrypt = require('bcrypt');


module.exports = {
    create: function (data) {
        return new Promise(function (resolve, reject) {
            validateUserData(data)
                .then(function() {
                    return uniqueEmail(data.email);
                })
                .then(function() {
                    return hashPassword(data.password);
                })
                .then(function(hash) {
                    return pool.query(` 
                   INSERT INTO "user" (first_name, last_name, _password, email)
                   VALUES ($1, $2, $3, $4)`, [data.first_name, data.last_name, hash, data.email]);
                })
                .then(function(result) {
                    resolve(result.rows)
                })
                .catch(function(err) {
                    reject(err);
                })
        });
    },


    authenticate: function(data) {
        return new Promise(function(resolve, reject) {
            // change all of this to one transaction?
            findOneByEmail(data.email)
                .then(function(user) {
                    return verifyPassword(data.password, user);
                })
                .then(function(result) {
                    resolve({ isAuthorized: result.isValid, id: result.id, user: result.user });
                })
                .catch(function(err) {
                    reject(err);
                });

        });
    }
};


function findOneByEmail(email) {
    return new Promise(function(resolve, reject) {
        pool.query('SELECT * FROM "user" WHERE email = $1', [email])
            .then(function(result) {
                if (result.rows[0]) {
                    console.log(result.rows[0]);
                    resolve(result.rows[0]);
                }
                else {
                    reject("Email doesn't exists")
                }
            })
            .catch(function(err) {
                reject(err);
            });
    });
}

function uniqueEmail(email) {
    return new Promise(function(resolve, reject) {
        pool.query('SELECT user_id FROM "user" WHERE email = $1', [email])
            .then(function(result) {
                if (result.rows[0]) {
                    reject('email already exists')
                }
                else {
                    resolve()
                }
            })
            .catch(function(err) {
                reject(err);
            });
    });
}

function hashPassword(password) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                reject(err);
            }
            else {
                bcrypt.hash(password, salt, function(err, hash) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(hash);
                    }
                });
            }
        });
    });
}

function validateUserData(data) {
    return new Promise(function(resolve, reject) {
   // End of post data validation
        validatePassword(data.password, 6)
            .then(function() {
                return validateEmail(data.email);
            })
            .then(function() {
                resolve();
            })
            .catch(function(err) {
                reject(err);
            });
    });
}

function validateEmail(email) {
    return new Promise(function(resolve, reject) {
        if (typeof (email) !== 'string') {
            reject('email must be a string');
        }
        else {
            var re = new RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
            if (re.test(email)) {
                resolve();
            }
            else {
                reject('provided email does not match proper email format');
            }
        }
    });
}

function validatePassword(password, minCharacters) {
    return new Promise(function(resolve, reject) {
        if (typeof (password) !== 'string') {
            reject('password must be a string');
        }
        else if (password.length < minCharacters) {
            reject('password must be at least ' + minCharacters + ' characters long');
        }
        else {
            resolve();
        }
    });
}

function verifyPassword(password, user) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(password, user._password)
            .then( (compareResult) => {
                if (compareResult) {
                    resolve({isValid: compareResult, id: user.user_id, user: user});
                } else {
                    reject('Incorrect password details')
                }
            })
            .catch( (err) => {
                reject(err);
            });
    })
}



