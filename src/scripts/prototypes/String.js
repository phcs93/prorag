// normalize a string to make it easier to compare
Object.defineProperty(String.prototype, "flatten", {
    value: function () {
        return this.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ç/g, "c")
        .replace(/Ç/g, "C")
        .toUpperCase();
    }
});