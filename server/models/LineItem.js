/*-----------------------------------LINEITEM MODEL---------------------------------------------*/



// Deklarer en klasse med de attributter som  LineItem-klassen skal have.
// Klassen bruges i Cart-modellen i Cart-klassens 'items'-attribut, som indeholder instanser af LineItem klassen.
// Når der tilføjes et produkt instantieres et nyt LineItem-objekt, der refererer til det produkt, som kunden har valgt.
module.exports = class LineItem {
    constructor(product, unit_price, qty, price) {
        this.product = product || {};
        this.unit_price = unit_price || 0;
        this.qty = qty || 0;
        this.price = price || 0;
    }

    /*
    // Forslag til hvordan man vil kunne give rabat på et specifikt lineitem.
    provideDiscount(discount) {
        let discountRate = discount/100;
        this.unit_price *= (1-discountRate)
    }*/
};