
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
    window.location="/signup";
    window.onload=signup()


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
    let addBtns = document.getElementsByClassName('addLineItem');

    for (let i=0; i < addBtns.length; i++) {
        addBtns[i].click()
    }
    document.getElementById('order_button').click();
};



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

