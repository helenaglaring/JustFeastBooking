// https://stackoverflow.com/questions/59174763/how-to-add-product-to-shopping-cart-with-nodejs-express-and-mongoose
const pool = require('../db/db');
//const Product = require('Product');


// When ever we recreate our lineItem in the this.add we pass our old lineItem into it.
module.exports = function lineItem(oldLineItems){
    this.items = oldLineItems.items || {};
    this.totalQty = oldLineItems.totalQty || 0;
    this.totalPrice = oldLineItems.totalPrice || 0;


    this.add = function(product, id, order_id){
        // Nu vil vi sørge for, at Qty bliver opdateret i stedet for bare at tilføje endnu et objekt med samme id.
        // Dette gøres ved at opdatere en persons lineItem hver gang ved hjælp af følende funktion.
        let storedItem =  this.items[id];
        if (!storedItem){
            storedItem = this.items[id] = {product: product, qty: 0, price: 0};
        }
        storedItem.qty++;
        storedItem.price = storedItem.product.product_price * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.product.product_price;

        pool.query(`
            INSERT INTO lineitem (product_id, order_id, qty, lineitem_price)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (product_id, order_id)
            DO UPDATE SET qty = $3
            RETURNING *
    `, [storedItem.product.product_id, order_id, storedItem.qty, storedItem.product.product_price])
            .then(result => {
                //res.json(result.rows[0]);
                console.log("Product tilføjet til kurv: ");
                console.log(result.rows[0]);
            });
    };

    this.remove = function(product, id, order_id){
        // Nu vil vi sørge for, at Qty bliver opdateret
        // Dette gøres ved at opdatere en persons lineItem hver gang ved hjælp af følende funktion.
        let storedItem =  this.items[id];
        //if (!storedItem){
         //   storedItem = this.items[id] = {product: product, qty: 0, price: 0};
       // }
        if (storedItem.qty===0 || this.totalQty ===0) {
            console.log("Ingen produkter kan fjernes, da de ikke er i kurv");
            return false;
        } else if (storedItem.qty===1) {
            storedItem = this.items[id] = {product: product, qty: 0, price: 0};
            this.totalQty--;
            this.totalPrice -= storedItem.product.product_price;
            pool.query(`
                DELETE FROM lineitem 
                WHERE product_id=$1 AND order_id=$2 
                RETURNING *`
                , [storedItem.product.product_id, order_id])
                .then(result => {
                    console.log("Product fjernet fra kurv. 0 tilbage: ");
                    console.log(result.rows[0]);
                });
        } else {
            storedItem.qty--;
            storedItem.price = storedItem.product.product_price * storedItem.qty;
            this.totalQty--;
            this.totalPrice -= storedItem.product.product_price;
            pool.query(`
                UPDATE lineitem 
                SET qty = $1
                WHERE product_id=$2 AND order_id=$3 
                RETURNING *`
                , [storedItem.qty, storedItem.product.product_id, order_id])
                .then(result => {
                    console.log("Et produkt fjernet.");
                    console.log(result.rows);
                })
                .catch((err) => console.log(err))
        }
    };


    this.gennerateArray = function () {
        let arr = [];
        for (let id in this.items){
            arr.push(this.items[id]);
        }
        return arr
    };
};