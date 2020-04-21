const pool = require('../db/db');

module.exports = {
    create: function (order_id, user_id, totalAmount) {
        return new Promise(function (resolve, reject) {
            pool.query(`
                   INSERT INTO payment (order_id, user_id, amount)
                    VALUES ($1, $2, $3)`
                , [order_id, user_id, totalAmount])

                .then(result => {
                    resolve(result.rows[0]);

                })
                .catch((err) => {
                    reject(err);
                    console.log(err)
                });
        });
    },
    findOne: function(data) {
        return new Promise((resolve, reject)  =>{
            findOneById(data.order_id)
                .then( (result) => {
                    resolve(result)
                })
                .catch( (err) =>  {
                    reject(err);
                    console.log(err)
                });
        })
    }
};

function findOneById(id) {
    return new Promise(function(resolve, reject) {
        pool.query('SELECT * FROM payment WHERE order_id = $1', [id])
            .then(function(result) {
                //console.log("findOneByID::")
                //console.log(result);
                //console.log(result.rows[0]);
                if (result.rows[0]) {
                    resolve({isTrue: true});
                    console.log("Der er betalt")
                }
                else {
                    resolve({isTrue: false});
                    console.log("Der er ikke betalt")

                }
            })
            .catch(function(err) {
                reject(err);
                //console.log(err);
            });
    });
}




