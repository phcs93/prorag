customElements.define("equip-picker", class EquipPicker extends HTMLElement {

    constructor() {
        super();
        this.appendChild(document.getElementById("equip-picker").content.cloneNode(true));
        switch (this.id) {
            case "top-head": {
                // show only top head items
                break;
            }
        }
    }

    // static get observedAttributes() {
    //     return ["selected"];
    // }

    // connectedCallback() { }
    // disconnectedCallback() { }
    // adoptedCallback() { }

    // attributeChangedCallback(property, oldValue, newValue) {
    //     if (oldValue === newValue) return;
    //     this[property] = newValue;
    // }

});