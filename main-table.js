    import { setupTable } from "./table-helper.js";
    import { getOrders } from "./data-helper.js"
    import { Order } from "./Order.js";
    import { renderFinished } from "./finished-tasks-table.js";

    await refreshBoard();

    setInterval(() => { refreshBoard().catch(() => {}); }, 10000);

function activeOrders(ordrs) {
    return ordrs
        .filter(order => !order.isRemoved())
        // All four operations finished: the row belongs in the finished
        // table on the right, not here.
        .filter(order => !order.allOperationsDone)
        .filter(order => !order.containsComment("valmis"))
        .filter(order => order.so_nr != null)
        .filter(order => order.task != null);
}

/**
 * Rebuild both tables from one read.
 *
 * One read, so a finished order leaves the left table in the same pass as it
 * appears on the right; separate reads let it show in both at once. The
 * previous version also only appended rows when the order count grew and never
 * touched an existing one, so an operation finished on an order already on
 * screen changed nothing.
 */
async function refreshBoard() {
    const all = await getOrders();
    const active = activeOrders(all);

    Order.currentOrders = Array.from(active);

    const table_body = document.getElementById("tableBody");
    table_body.innerHTML = "";
    setupTable(table_body, active, true);

    renderFinished(all);
}
