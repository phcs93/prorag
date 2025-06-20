globals = {
    
    database: {

        // database is kept in memory as gzip to spare memory
        gzip: null,

        // database is only uncompressed during a query operation
        unzip: () => JSON.parse(pako.ungzip(globals.database.gzip, { to: "string" })),

        // query operations
        query: {
            getItemById: id => globals.database.unzip().equipment[id],
            getItemByDescription: description => Object.values(globals.database.unzip().equipment).filter(e => e.description.flatten().indexOf(description.flatten()) > -1),
            getSkillById: id => globals.database.unzip().skills[id],
            getSkillByDescription: description => Object.values(globals.database.unzip().skills).filter(e => e.description.flatten().indexOf(description.flatten()) > -1)
        }

    }

}