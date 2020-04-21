const pool = require('../db/db');


module.exports = {
    findAll: function () {
        return new Promise(function (resolve, reject) {
            pool.query('SELECT * FROM product')
                .then(function (results) {
                    console.log(results.rows);
                    resolve(results.rows);
                })
                .catch(function (err) {
                    reject(err);
                    console.log(err);
                });
        });
    },

    findById: function(id) {
        return new Promise(function(resolve, reject) {
            pool.query('SELECT * FROM product WHERE product_id = $1', [id])
                .then(function(result) {
                    if (result.rows[0]) {
                        console.log("Det valgte produkt:");
                        console.log(result.rows[0]);
                        resolve(result.rows[0]);
                    }
                    else {
                        reject('no lineitems found');
                    }
                })
                .catch(function(err) {
                    reject(err);
                    console.log(err);
                });
        });
    },
};


