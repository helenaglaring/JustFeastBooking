
const pool = require('../db/db');

module.exports = {
    create: function (data, user_id) {
        return new Promise( (resolve, reject)=> {
            pool.query(`
                INSERT INTO address (user_id, streetname, streetnumber, zipcode, city)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (user_id)
                DO UPDATE SET streetname=$2, streetnumber=$3, zipcode=$4, city=$5
                RETURNING *`
            , [user_id, data.streetname, data.streetnumber, data.zipcode, data.city])
            .then(result => {
                resolve(result.rows[0]);
            })
            .catch((err) => {
                reject('Noget gik galt');
                console.log(err)
            });
        });
    },

    findOne: function(data) {
        return new Promise((resolve, reject)  =>{
            findOneById(data.user_id)
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
        pool.query('SELECT * FROM address WHERE user_id = $1', [id])
            .then(function(result) {
                if (result.rows[0]) {
                    console.log(result.rows[0]);
                    resolve(result.rows[0]);
                }
                else {
                    reject("Ingen addresse fundet")
                }
            })
            .catch(function(err) {
                reject(err);
            });
    });
}