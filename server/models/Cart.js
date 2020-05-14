// https://stackoverflow.com/questions/59174763/how-to-add-product-to-shopping-cart-with-nodejs-express-and-mongoose
// https://github.com/jmmostov/SkipTheLine/blob/master/models/LineItem.js

/*-----------------------------------CART MODEL---------------------------------------------*/

// Database-connection
const pool = require('../db/db');

// Importerer LineItem klassen
const LineItem = require('../models/LineItem');

// Cart-modellen fungerer som kundens 'kurv'. Deklarer en constructor-funktion med de attributter som vores cart skal have.
// Tager et 'gammelt' cart-objekt som parameter. Hvis det eksisterer i forvejen instantieres et cart med de eksisterende værdier
// Hvis oldCart er et tomt objekt, sættes det til de tomme værdier.
// items-attributten indeholder objektinstanser af LineItem-klassen og refererer det specifikke produkt
module.exports = class Cart {
    constructor(items, totalQty, totalPrice, deliveryFee, orderID) {
        this.items = items || {}; //lineitems
        this.totalQty = totalQty || 0;
        this.totalPrice = totalPrice || 0;
        this.deliveryFee = deliveryFee || 0;
        this.orderID = orderID || 0;
    }

    // Metode der tilføjer produkter til cart
    // Den gør at Qty bliver opdateret i stedet for bare at tilføje endnu et objekt med samme id.
    // Dette gøres ved at opdatere et LineItem-objekt hver gang ved hjælp af følgende metode.
    add(product, id) {
        let storedItem =  this.items[id] ;

        // If-statement der eksekveres hvis det valgt produkt endnu ikke findes i kurven. Da vil værdien af storedItem være false, da 'this.items[id]' ikke er defineret.
        // instantierer en ny instans af LineItem klassen der refererer det givne produkt
        if (!storedItem){
            //storedItem = this.items[id] = {product: product, qty: 0, price: 0};
            storedItem = this.items[id] = new LineItem(product, product.productPrice, 0, 0);
        }
        // Hvis der allerede findes et LineItem objekt af det valgte produkt vil vi ikke komme ind i if-statementet, da storedItem=true.
        // Ændrer attributterne for det givne lineItem sådan at qty og price øges.
        storedItem.qty++;
        storedItem.price = storedItem.unit_price * storedItem.qty;
        // Attributterne for kurvens totale pris og antal øges

        this.totalQty++;
        this.totalPrice += storedItem.unit_price;

        console.log(storedItem);

    };

    // Metode der fjerner et lineitem fra cart ved at decrease Qty med 1.
    deleteOne(id) {
        // Decreaser lineItem-objektets qty attribut med 1
        this.items[id].qty--;
        // Decreaser den samlede pris(price-attribut) for alle LineItems af den givne type med unit-prisen for det pågældende lineitem.
        this.items[id].price -= this.items[id].unit_price;
        // Decreaser kurvens samlede antal
        this.totalQty--;
        // Trækker lineitemets pris fra kurvens samlede pris.
        this.totalPrice -= this.items[id].unit_price;
        // Hvis antallet af det specifikke lineitem er <=0 fjernes det helt fra this.items.
        if(this.items[id].qty <= 0) {
            delete this.items[id];
        }
    };

    // Metode der sletter alle lineitems med givent product_id.
    deleteAll(id) {
        this.totalQty -=this.items[id].qty;
        this.totalPrice -=this.items[id].price;
        delete this.items[id];
        //console.log("Alle lineitems af dette produkt fjernet fra kurv. ");
    };

    // Metode der opretter array med alle lineitems i this.items-objektet.
    // Bruges til at vise de lineitems der er i nuværende kurv til klienten.
    generateArray() {
        let arr = [];
        for (let id in this.items){
            arr.push(this.items[id]);
        }
        return arr
    };

    // Metode der tilføjer deliveryFee. Bruges når kunde submitter delivery-method form.
    addDeliveryFee(deliveryIsTrue) {
        let deliveryFee = 45;
        // Undersøger om levering er true
        if(deliveryIsTrue) {
            if (this.deliveryFee <= 0) { // Sikrer at deliveryFee ikke tilføjes flere gange
                this.deliveryFee = deliveryFee;
                this.totalPrice += this.deliveryFee; // Tilføjer deliveryFee oven i ordren
                console.log("Leveringsgebyr på 45 kr. er tilføjet.");
            }
            // Hvis levering er 'false' fjernes leveringsgebyr eller sættes lig 0
        } else {
            if (this.deliveryFee < 0) {
                this.deliveryFee = 0;
                this.totalPrice -= this.deliveryFee;
            } else {
                this.deliveryFee = 0;
            }
        }
    };

    //Metode der gemmer de lineitems kunde har lagt i kurv i db når kunden accepterer sin betaling.
    createOrder(orderID) {
        // Bruger for-loop til at iterere gennem de forskellige produkt-typer i items, og for hver indsætte de givne værdier i lineitems-tabel.
        for ( let id in this.items) {
            pool.query(`
                INSERT INTO lineitem (product_id, order_id, qty, lineitem_price)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (product_id, order_id)
                DO UPDATE SET qty = $3
                RETURNING *
    `, [this.items[id].product.productID, orderID, this.items[id].qty, this.items[id].unit_price])
                .then(result => {
                    console.log("LineItems gemt i database: ");
                    console.log(result.rows[0]); // Rækker for hver lineitem-type.
                });
        }
    };

};


/*----------------------------------- Skraldespand ------------------------------------------------------*/
/* Add-metoden inden implementering af 'lineItem-klasse'.
 add(product, id) {
        let storedItem =  this.items[id];
        if (!storedItem){
            storedItem = this.items[id] = {product: product, qty: 0, price: 0};
        }
        storedItem.qty++;
        storedItem.price = storedItem.product.productPrice * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.product.productPrice;
    };

    // Metode der fjerner et lineitem fra cart ved at decrease Qty med 1.
    deleteOne(id) {
        this.items[id].qty--;
        this.items[id].price -= this.items[id].product.productPrice;
        this.totalQty--;
        this.totalPrice -= this.items[id].product.productPrice;
        // Hvis antallet af det specifikke lineitem er <=0 fjernes det helt fra this.items.
        if(this.items[id].qty <= 0) {
            delete this.items[id];
        }
    };
* */


/*----------------------------------- Skraldespand 2 ------------------------------------------------------*/
/* Her blev lineitems indsat direkte i databasen

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
*/


/*
/////////////////////////// 2
// When ever we recreate our lineItem in the this.add we pass our old lineItem into it.
module.exports = function cart(oldCart){
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;
    this.deliveryFee = oldCart.deliveryFee || 0;


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
        console.log("Product tilføjet til kurv: ");


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

    this.deleteOne = function(product, id, order_id){
        // Nu vil vi sørge for, at Qty bliver opdateret
        // Dette gøres ved at opdatere en persons lineItem hver gang ved hjælp af følende funktion.
        let storedItem =  this.items[id];
        if (storedItem.qty===0 || this.totalQty ===0) {
            console.log("Ingen produkter kan fjernes, da de ikke er i kurv");
            return false;
        } else if (storedItem.qty===1) {
            storedItem = this.items[id] = {product: product, qty: 0, price: 0};
            this.totalQty--;
            this.totalPrice -= storedItem.product.product_price;
            console.log("Product fjernet fra kurv. 0 tilbage: ");

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
            console.log("Et produkt fjernet.");

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

    this.deleteAll = function(id, order_id) {
        this.totalQty -=this.items[id].qty;
        this.totalPrice -=this.items[id].price;
        delete this.items[id];
        console.log("Alle lineitems af dette produkt fjernet fra kurv. ");

        pool.query(`
                DELETE FROM lineitem
                WHERE product_id=$1 AND order_id=$2
                RETURNING *`
            , [id, order_id])
            .then(result => {
                console.log("Alle lineitems af dette produkt fjernet fra kurv. ");
                console.log(result.rows[0]);
            });
    };


    this.generateArray = function () {
        let arr = [];
        for (let id in this.items){
            arr.push(this.items[id]);
        }
        return arr
    };


    this.create = function (order_id) {
        for ( let id in this.items) {
            pool.query(`
                INSERT INTO lineitem (product_id, order_id, qty, lineitem_price)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (product_id, order_id)
                DO UPDATE SET qty = $3
                RETURNING *
    `, [this.items[id].product.product_id, order_id, this.items[id].qty, this.items[id].product.product_price])
                .then(result => {
                    //res.json(result.rows[0]);
                    console.log("LineItems gemt i database: ");
                    console.log(result.rows[0]);
                });
        }
    }
};
*/