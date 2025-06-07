window.addEventListener('DOMContentLoaded', async function() {

    // store database in memory as gzip
    const databaseGzip = await (await fetch("bin/database-latam-pt-json.gzip")).arrayBuffer();

    //const json = JSON.parse(pako.ungzip(databaseGzip, { to: "string" }));

    // init micromodal lib
    MicroModal.init({
        onShow: modal => console.info(`${modal.id} is shown`),
        onClose: modal => console.info(`${modal.id} is hidden`),
        closeTrigger: 'data-micromodal-close',
        openClass: 'is-open',
        disableScroll: true,
        disableFocus: true,
        awaitOpenAnimation: false,
        awaitCloseAnimation: false
    });

});