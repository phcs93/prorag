customElements.define("equip-display", class EquipDisplay extends HTMLElement {

    constructor() {
        super();
        this.appendChild(document.getElementById("equip-display").content.cloneNode(true));
    }

    // connectedCallback() { }
    // disconnectedCallback() { }
    // adoptedCallback() { }

    static get observedAttributes() {
        return ["number", "refinement"];
    }

    attributeChangedCallback(property, oldValue, newValue) {
        //if ((this[property] = newValue) === oldValue) return;
        switch (property) {
            case "number": {
                const equip = globals.database.query.getItemById(newValue);
                this.querySelector("label.name").innerHTML = equip?.name || "---";
                this.querySelector("div.equip-icon").dataset.id = equip?.id || 0;                
            }
            case "refinement": {
                this.querySelector("label.refinement").innerHTML = `+${newValue}`;
                break;
            }
        }
    }

});