// Fetch:
const _apiHost = 'http://localhost:3000/';
async function request(url, params, method = 'GET'){
    // Options passed to the fetch request
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json' // we will be sending JSON
        }
    };

    // If params exists and method i GET, add querystring to url
    // otherwise just add params as a 'body' property to the options object
    if (params) {
        if (method === 'GET' || method === 'PUT') {
            url += `${params}`;
        } else {
            options.body = JSON.stringify(params);  // body should match Content-Type in headers option
        }
    }
    // fetch returns a promise, so we add keyword await to wait until promise settles

    const response = await fetch(_apiHost + url, options);

    // show an error if the status code is not 200
    if (response.status !== 200) {
        return generateErrorResponse('The server responded with an unexpected status.');
    }

    const result = await response.json();
    // Returns a single promise object

    return result;

}

// A generic error handler that just returns an object with status=error and message
function generateErrorResponse(message) {
    return {
        status : 'error',
        message
    };
}

// Handle parameters for all request types
// converts an object into a query string


function get(url, params) {
    return request(url, params);
}
function create(url, params) {
    return request(url, params, 'POST');
}

function update(url, params) {
    return request(url, params, 'PUT');
}


function remove(url, params) {
    return request(url, params, 'DELETE');
}


export default {
    get,
    create,
    update,
    remove
};