import { setupTable } from "./table-helper.js";

/**
 * Draw the finished table from an order list the caller already has.
 *
 * It deliberately does not fetch: the row that leaves the left table has to
 * arrive here in the same pass, and two independent reads would leave it in
 * both tables, or in neither, until they caught up with each other.
 */
export function renderFinished(orders) {
    const body = document.getElementById("finished-tasks-table");
    if (!body) return;

    body.innerHTML = "";
    setupTable(body, getCompletedOrders(orders), false);
}

function getCompletedOrders(orders) {
    return orders.filter(order => {
        const order_comments = order.getComments();

        if (order.isRemoved()) return false;

        // Finished by the work itself, or marked finished by hand. The
        // comment rule stays so the existing manual override keeps working.
        if (order.allOperationsDone) return true;

        return order_comments != null
            && order_comments.toLowerCase().includes("valmis");
    });
}
