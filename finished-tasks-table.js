import { setupTable } from "./table-helper.js";
import { getOrders } from "./data-helper.js"

const today = new Date().toISOString().split("T")[0];

let orders = await getOrders();

let completedOrders = getCompletedOrders(orders);

//let completedToday = orders.filter(order => order.status == "done");

let table_body = document.getElementById("finished-tasks-table");

setupTable(table_body, completedOrders, false);

setInterval(refreshFinishedTable, 10000);

async function refreshFinishedTable() {
    const fresh = getCompletedOrders(await getOrders());
    const body = document.getElementById("finished-tasks-table");
    body.innerHTML = "";
    setupTable(body, fresh, false);
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