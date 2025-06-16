globals = {
    
    database: {

        // database is kept in memory as gzip to spare memory
        gzip: null,

        // database is only uncompressed during a query operation
        unzip: () => JSON.parse(pako.ungzip(globals.database.gzip, { to: "string" })),

        // query operations
        query: {
            getItemById: id => {
                return globals.database.unzip().equipment[id];
            },
            getItemByDescription: description => {
                return Object.values(globals.database.unzip().equipment).filter(e => e.description.flatten().indexOf(description.flatten()) > -1);
            }
        }

    }

}