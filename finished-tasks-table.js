import { setupTable } from "./table-helper.js";
import { isFinishedOrder } from "./data-helper.js";

/**
 * Draw the finished table from an order list the caller already has.
 *
 * It deliberately does not fetch: the row that leaves the left table has to
 * arrive here in the same pass, and two independent reads would leave it in
 * both tables, or in neither, until they caught up with each other.
 */
export function renderFinished(orders) {
    // The id is on the <table>, so clearing that would take the column
    // headers with it. Rows live in the tbody.
    const table = document.getElementById("finished-tasks-table");
    if (!table) return;

    const body = table.tBodies[0] || table;
    body.innerHTML = "";
    setupTable(body, getCompletedOrders(orders).reverse(), false);
}

function getCompletedOrders(orders) {
    return orders.filter(order => {
        if (order.isRemoved()) return false;

        return isFinishedOrder(order);
    });
}
