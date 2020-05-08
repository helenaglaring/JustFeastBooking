
/*--deleteLineitem.js--------------------------CLIENT SIDE VALIDATION-----------------------------------------------------*/
// bruges ikke

//import Fetch from './fetch';

console.log("test");
//const axios = require('axios');


//https://attacomsian.com/blog/axios-javascript
const deleteLineItem = (formData) => {
    const productID =  formData.get('product_id');
    console.log(formData);
    axios.put(`http://localhost:3000/cart/remove-item/${productID}`,
        { body: data })
        //.then(res => res.json())
        .then(res => console.log("PUT test" + res))
        .catch(error => console.error(error));

};

const deleteForms = document.querySelectorAll('.removeLineItem');

deleteForms.forEach(deleteForm => {
    deleteForm.addEventListener('submit', event=> {
        event.preventDefault();
        console.log("Eventlistener submit");

        let action = deleteForm.action;
        console.log(action);

        axios.put(action)
            .then(res =>

                console.log("PUT test" ))
            .catch(error => console.error(error));
    });

});


// https://flaviocopes.com/how-to-add-event-listener-multiple-elements-javascript/
/* Med objekter:
const deleteForms = document.querySelectorAll('.removeLineItem');

deleteForms.forEach(deleteForm => {
    deleteForm.addEventListener('submit', event=> {
        event.preventDefault();
        console.log("Eventlistener submit");
        console.log(deleteForm.action);

        //const newFormData = new FormData(deleteForm);
       // console.log(newFormData.get('lineitem_price'));
        //data der skal sendes
        let data = {
            product: event.target["product_id"].value,//newFormData.get('product_id'),
            price: event.target["lineitem_price"].value//newFormData.get('lineitem_price')
        };
        console.log(data);
        return axios.put(`http://localhost:3000/cart/remove-item/${data.product}`, data, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(res => console.log("PUT test" + res))
            .catch(error => console.error(error));
    });

});
*/




/*
formElem.addEventListener('submit', _=> {
    console.log("TESTING");
    const newFormData = new FormData(formElem);
    console.log(newFormData.get('product_id'));

})
*/
    /*
    axios.put('/cart/remove-item/', {
        params: {
            product_id:
        }
    })
    const options = {
        method: 'PUT',
        //url: 'http://localhost:3000/cart/remove-item/2',
        body: new FormData(formElem)
        params:
    }
    axios(options)
        .then(res => res.json())
        .then(res => console.log("PUT test" + res))

})
*/
//

// https://flaviocopes.com/how-to-add-event-listener-multiple-elements-javascript/
// Med formData:
/*
const deleteForms = document.querySelectorAll('.removeLineItem');

deleteForms.forEach(deleteForm => {
    deleteForm.addEventListener('submit', event=> {
        event.preventDefault();
        console.log("Eventlistener submit");


        const newFormData = new FormData(deleteForm);
        console.log(newFormData);
        console.log(newFormData.get('lineitem_price'));
        //data der skal sendes

        let data = newFormData;
        console.log(data);

        axios.post(`http://localhost:3000/cart/remove-item/${data.product}`, data, {
            headers: {
                'Content-Type':'application/x-www-form-urlencoded'
            }
        })
            .then(res => console.log("PUT test" + res))
            .catch(error => console.error(error));
    });

});



// Med fetch:
const deleteForms = document.querySelectorAll('.removeLineItem');

deleteForms.forEach(deleteForm => {
    deleteForm.addEventListener('submit', event=> {
        event.preventDefault();
        console.log("Eventlistener submit");
        //console.log(deleteForm.action);

        //const newFormData = new FormData(deleteForm);
       // console.log(newFormData.get('lineitem_price'));
        //data der skal sendes
        data.product = event.target["product_id"].value;//newFormData.get('product_id'),
        data.price = event.target["lineitem_price"].value;//newFormData.get('lineitem_price')

        console.log(data);
/*
        return axios.put(`http://localhost:3000/cart/remove-item/${data.product}`, data, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(res => console.log("PUT test" + res))
            .catch(error => console.error(error));

        async function deleteLineItem(data) {

        }
    });

});
*/