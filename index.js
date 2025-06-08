window.addEventListener('DOMContentLoaded', async function() {

    // store database in memory as gzip
    globals.database.gzip = await (await fetch("bin/database-latam-pt-json.gzip")).arrayBuffer();

    // init micromodal lib
    MicroModal.init({
        onShow: modal => console.info(`${modal.id} is shown`),
        onClose: modal => console.info(`${modal.id} is hidden`),
        closeTrigger: "data-micromodal-close",
        openClass: "is-open",
        disableScroll: true,
        disableFocus: true,
        awaitOpenAnimation: false,
        awaitCloseAnimation: false
    });

});