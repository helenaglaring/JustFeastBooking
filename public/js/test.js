
const firstNameTest = "testFirstName";
const lastNameTest = "testLastName";
const emailTest = "testEmail@test.dk";
const passwordTest = "testPassword";
const deliveryTime = "10:00";
const streetNameTest = "testStreet";
const streetNumberTest = "20A";
const zipCodeTest = 1234;
const cityTest = "testCity";
const cdNameTest = "test name";
const cdNrTest = 1234123412341234;
const expMonthTest = 1;
const expYearTest = 20;
const cvcTest = 123;

// With delivery
function testWithDelivery(){
    // Redirect til signup-page
    window.location="/user/signup";
    window.onload = signup()
}

function signup() {
    document.getElementById('first_name').value = firstNameTest;
    document.getElementById('last_name').value = lastNameTest;
    document.getElementById('email').value = emailTest;
    document.getElementById('password').value = passwordTest;
    document.getElementById('submit-signup').click();
}


function login() {
    document.getElementById('email').value = emailTest;
    document.getElementById('password').value = passwordTest;
    document.getElementById('submit-login').click();

}

function toCart() {
    window.location="/products";
}


function addItemsToCart() {
    fetch('/cart/lineitems/add/1', {
        method: 'PUT'

    }).then(result => {
        fetch('/cart/lineitems/add/2', {
            method: 'PUT'
        }).then(result => {
            fetch('/cart/lineitems/add/3', {
                method: 'PUT'
            }).then(result => {
                $("#order_button").click()
            })

        })
    }).catch(err => {
        console.log(err);
    })
}



function deliveryTrue() {
    document.getElementById('yes-delivery').click();
    document.getElementById('selectedTime').value = deliveryTime;
    document.getElementById('submit-delivery-information').click();

}


function deliveryAddress() {
    document.getElementById('val_streetname').value = streetNameTest;
    document.getElementById('val_streetnumber').value = streetNumberTest;
    document.getElementById('val_zipcode').value = zipCodeTest;
    document.getElementById('val_city').value = cityTest;
    document.getElementById('submit-address-information').click();
}



function payment() {
    document.getElementById('cardHoldersName').value = cdNameTest;
    document.getElementById('cardNumber').value = cdNrTest;
    document.getElementById('expiryDateMonth').value = expMonthTest;
    document.getElementById('expiryDateYear').value = expYearTest;
    document.getElementById('CVC').value = cvcTest;
    document.getElementById('paymentButton').click();

}


/*
// With delivery
function first(callback){
    testWithDelivery();
    callback();
}

function second(callback){
    $("#testSignup").click();
    callback();
}

function third(callback){
    $("#testLogin").click();
    callback();
}
function fourth(callback){
    $("#testLogin").click();
    callback();
}
function fifth(callback){
    $("#toCart").click();
    callback();
}
function sixth(callback){
    $("#testCart").click();
    callback();
}
function seventh(callback){
    $("#testDelivery").click();
    callback();
}
function eighth(callback){
    $("#testDeliveryAddress").click();
    callback();
}


function ninth(callback){
    $("#testDeliveryAddress").click();
    callback();
}
function test(callback) {
    first(function() {
        second(function() {
            third(function() {
                fourth(function(){
                    fifth(function(){
                        sixth(function(){
                            seventh(function(){
                                eighth(function(){
                                    ninth(callback);
                                })
                            })
                        })
                    })
                });
            });
        });
    });
}

*/