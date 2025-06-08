globals = {
    database: {
        gzip: null,
        unzip: () => JSON.parse(pako.ungzip(globals.database.gzip, { to: "string" })),
        query: {
            getItemById: id => {
                return globals.database.unzip().equips[id];
            }
        }
    }
}