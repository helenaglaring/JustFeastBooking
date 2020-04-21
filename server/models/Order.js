const pool = require('../db/db');


module.exports = {

    updateStatus: function (data) {
        return new Promise(function (resolve, reject) {
            if (!data.status === 'cart') {
                reject('Status af ordre er ikke "Pending"');
            } else {
                pool.query(`UPDATE "order" SET status='pending' WHERE order_id = $1 RETURNING status`
                    , [data.order_id])
                    .then(function () {
                        resolve('Ordre-status ændret fra "cart" til "pending"');
                    })
                    .catch(function (err) {
                        reject(err);
                        console.log(err)
                    });
            }
        });
    },

    placeOrder: function (data) {
        return new Promise(function (resolve, reject) {
            if (!data.status === 'cart') {
                reject('Status af ordre er ikke "cart"');
            } else if (data.status === 'order') {
                reject('Du har allerede betalt for ordren. Ordre-status er "order"');
            } else {
                pool.query(`
                    UPDATE "order"
                    SET order_date=DEFAULT, status='order'
                    WHERE order_id =$1
                    RETURNING *
                `, [data.order_id])
                    .then(result => {
                        console.log("Order-status ændret fra 'cart' til 'ordre': ");
                        console.log(result.rows[0]);
                        resolve(result.rows[0]);
                    })
                    .catch((err) => {
                        reject(err);
                        console.log(err)
                    });
            }
        });
    },
    findOne: function(id) {
        return new Promise((resolve, reject)  =>{
            findOneById(id)
                .then( (result) => {
                    resolve(result);
                })
                .catch( (err) =>  {
                    reject(err);
                });
        })
    }


};

function findOneById(id) {
    return new Promise(function(resolve, reject) {
        pool.query('SELECT * FROM "order" WHERE order_id = $1', [id])
            .then(function(result) {
                if (result.rows[0]) {
                    console.log(result.rows[0]);
                    resolve(result.rows[0]);
                }
                else {
                    reject("Ingen ordre fundet")
                }
            })
            .catch(function(err) {
                reject(err);
            });
    });
}
