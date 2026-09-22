    import { setupTable } from "./table-helper.js";
    import { getOrders } from "./data-helper.js"
    import { Order } from "./Order.js";
    import { renderFinished } from "./finished-tasks-table.js";

    // Declared before the first await: two polls can overlap and a slow
    // older answer must not repaint over a newer one.
    let refreshSeq = 0;

    // The interval is armed before the first read, so a screen that fails to
    // load once still tries again instead of staying blank until somebody
    // reloads the browser on the wall.
    setInterval(() => { refreshBoard().catch(err => console.error("board refresh failed", err)); }, 10000);

    await refreshBoard().catch(err => console.error("board refresh failed", err));

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
    const seq = ++refreshSeq;

    const all = await getOrders();
    if (seq !== refreshSeq) return;
    const active = activeOrders(all);

    Order.currentOrders = Array.from(active);

    const table_body = document.getElementById("tableBody");
    table_body.innerHTML = "";
    await setupTable(table_body, active, true);

    await renderFinished(all);
}
