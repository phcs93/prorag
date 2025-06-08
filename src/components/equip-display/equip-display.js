customElements.define("equip-display", class EquipDisplay extends HTMLElement {

    constructor() {
        super();
        this.appendChild(document.getElementById("equip-display").content.cloneNode(true));
    }

    // connectedCallback() { }
    // disconnectedCallback() { }
    // adoptedCallback() { }

    static get observedAttributes() {
        return ["refinement"];
    }

    attributeChangedCallback(property, oldValue, newValue) {
        //if ((this[property] = newValue) === oldValue) return;
        switch (property) {
            case "refinement": {
                this.querySelector("label.refinement").innerHTML = `+${newValue}`;
                break;
            }
        }
    }

});