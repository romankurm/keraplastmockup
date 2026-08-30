    import { setupTable } from "./table-helper.js";
    import { getOrders } from "./data-helper.js"
    import { Order } from "./Order.js";

    let sortedOrders = await getSortedOrders();

    Order.currentOrders = Array.from(sortedOrders);

    let table_body = document.getElementById("tableBody");

    setupTable(table_body, sortedOrders, true);

    const intervalID = setInterval(updateMainTable, 10000);

async function getSortedOrders() {
    let ordrs = await getOrders();

    return ordrs
        .filter(order => !order.isRemoved())
        .filter(order => !order.containsComment("valmis"))
        .filter(order => order.so_nr != null)
        .filter(order => order.task != null);
}

/**
 * Rebuild the table from one fresh read.
 *
 * The previous version only appended rows when the order count grew, so an
 * operation finished on an order already on screen never showed its tick mark,
 * and a row that should have dropped out stayed. Redrawing the whole body is
 * cheap at this row count and keeps every column, not just the tick marks,
 * honest.
 */
async function updateMainTable() {
    const newOrders = await getSortedOrders();

    Order.currentOrders = Array.from(newOrders);

    const table_body = document.getElementById("tableBody");
    table_body.innerHTML = "";

    setupTable(table_body, newOrders, true);
}
