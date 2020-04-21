const pool = require('../db/db');
module.exports = {

    create: function (data, order_id) {
        return new Promise(function (resolve, reject) {
            // Convert delivery to bool
            data.delivery = (data.delivery === 'true');
            console.log("delivery is converted to boolean expression: "+ data.delivery);
            pool.query(`
                INSERT INTO delivery (order_id, delivery, delivery_time)
                VALUES ($1, $2,$3)
                ON CONFLICT (order_id)
                DO UPDATE SET delivery=$2, delivery_time=$3
                RETURNING *`
                , [order_id, data.delivery, data.selectedTime])

            .then(result => {
                resolve(result.rows[0]);
                //req.session.delivery = result.rows[0];
                //res.redirect('delivery-address')
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
                    resolve(result.delivery);
                    console.log(result)
                })
                .catch( (err) =>  {
                    reject(err);
                });
        })
    }
};


function findOneById(id) {
    return new Promise(function(resolve, reject) {
        pool.query('SELECT * FROM delivery WHERE order_id = $1', [id])
            .then(function(result) {
                if (result.rows[0]) {
                    resolve(result.rows[0]);
                }
                else {
                    reject("Ingen oplysninger fundet")
                }
            })
            .catch(function(err) {
                reject(err);
            });
    });
}