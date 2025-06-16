customElements.define("equipment-display", class EquipmentDisplay extends HTMLElement {

    constructor() {
        super();
        this.appendChild(document.getElementById("equipment-display").content.cloneNode(true));
    }

    // connectedCallback() { }
    // disconnectedCallback() { }
    // adoptedCallback() { }

    static get observedAttributes() {
        return ["number", "refinement", "slot1", "slot2", "slot3", "slot4"];
    }

    attributeChangedCallback(property, oldValue, newValue) {
        //if ((this[property] = newValue) === oldValue) return;
        switch (property) {
            case "number": {
                const equip = globals.database.query.getItemById(newValue);
                this.querySelector("label.name").innerHTML = equip?.name || "---";
                this.querySelector("div.equip-icon").dataset.id = equip?.id || 0;
                // reset all slots to non-slots
                this.querySelectorAll("div.slot").forEach(e => {
                    e.dataset.id = "";
                });
                // set available slots to 0 (empty)
                for (let i = 1; i <= equip?.slots; i++) {
                    this.querySelector(`div.slot${i}`).dataset.id = 0;
                }
                break;             
            }
            case "refinement": {
                this.querySelector("label.refinement").innerHTML = `+${newValue}`;
                break;
            }
            case "slot1": case "slot2": case "slot3": case "slot4": {
                // if the value is valid and the slot is available
                if (newValue != "" && newValue != null && 
                    this.querySelector(`div.${property}`).dataset.id != "" &&
                    this.querySelector(`div.${property}`).dataset.id != null
                ) {
                    this.querySelector(`div.${property}`).dataset.id = newValue;
                }
                break;
            }
        }
    }

});