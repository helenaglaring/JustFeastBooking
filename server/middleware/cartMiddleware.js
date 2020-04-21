//const express = require('express');
//const router = express.Router();
// Import pool connection
const pool = require('../db/db');

/*----------------------------------- Middleware  ------------------------------------------------------*/

//-- Creates cart --//
//-- Creates cart --//
exports.createCart = function(req, res, next)  {
    try {
        pool.query(`
            SELECT *
            FROM "order" 
            WHERE (user_id=$1 AND status='cart') `
            , [req.session.user.user_id], function(err, result) {
                // Checks if there already exists a cart with current user_id and status as 'cart'
                if(result.rows[0]) {
                    // If cart already exists set order and order_id is saved in session.
                    req.session.order = result.rows[0];
                    //req.session.order_id = req.session.order.order_id;
                    console.log("Cart er allerede oprettet med ordre-ID: "+ req.session.order.order_id );
                    console.log("Nuævrende ordre: ");
                    console.log(req.session.order);
                    next();
                } else {
                    pool.query(`
                    INSERT INTO "order" (user_id, status)
                    VALUES ($1, 'cart') RETURNING*`
                        , [req.session.user.user_id], function(err, result) {
                            if(err) {
                                console.log(err);
                            } else {
                                req.session.order = result.rows[0];
                                //req.session.order_id = req.session.order.order_id;
                                console.log("Cart er blevet oprettet med ordre-ID: " + req.session.order_id);
                                next()
                            }
                        }
                    );
                }
            });
    }
    catch(e) {
        throw(e)
    }
};


//-- Loads products from database --//
//behøver ikke

exports.products = function(req, res, next) {
    pool.query('SELECT * FROM product', function(err, result) {
        if (err) {
            console.log(err);
            res.status(400).send(err);
            next()
        }
        // save products in session
        req.session.products = result.rows;
        next();
    });
};


//-- Load current cart --//
exports.currentCart = function(req, res, next)  {
    let orderID = req.session.order.order_id;
    console.log("nuværende ordre-ID: " + orderID);
    pool.query(`
        SELECT lineitem.product_id, lineitem.qty, lineitem.order_id, lineitem.lineitem_price, product.product_name
        FROM lineitem
        INNER JOIN product on lineitem.product_id = product.product_id
        WHERE lineitem.order_id=$1`, [orderID])
        .then(result => {
            req.session.cart = result.rows;
            console.log("Nuværende lineitems i kurv:" );
            console.log(req.session.cart);
            next()
        })
        .catch((err) => {
            console.log(err)
            next();
        });
};

/*
exports.lineitems = (req,res, next)=> {
    // We try to find all products created in the database
    //const products = Product.find({});
    console.log(JSON.stringify(req.session.lineItems));
    let lineItems = new LineItem(req.session.lineItems ? req.session.lineItems: {});
    next()
};*/