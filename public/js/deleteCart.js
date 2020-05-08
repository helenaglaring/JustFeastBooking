console.log("deleteCart");

/*--deleteCart.js--------------------------FETCH DELETE REQUEST-----------------------------------------------------*/

// Deklarerer elementet for 'deleteCart'-knappen til variabel
// Knappen er tilgængelig i  ejs filerne "delivery-method, delivery-address and payment".

// Tilføjer eventlistener der lytter på 'click' til deleteCart-knappen.
const delBtn = document.getElementById('deleteCart');
delBtn.addEventListener('click', deleteCart);


// Efterfølgende fetch'er vi  API kaldet: cart/delete/:id
// Den bruger DELETE-metoden og redirecter til product-siden
function deleteCart () {
        console.log("Eventlistener submit");

        // Deklarerer variabel der holder værdien af det nuværende order_id. Dette er sat som value-attribut i ejs-templaten.
        let order_id = delBtn.value;
        console.log(order_id);

        // OrderID sendes som req.params
        fetch('/cart/delete/'+ order_id, {
            method: 'DELETE'
        })
            .then( json => {
            location.href = "http://localhost:3000/products";
        })
};
