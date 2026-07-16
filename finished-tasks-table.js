import { setupTable } from "./table-helper.js";
import { getOrders } from "./data-helper.js"

const today = new Date().toISOString().split("T")[0];

let orders = await getOrders();

let completedOrders = getCompletedOrders(orders);

//let completedToday = orders.filter(order => order.status == "done");

let table_body = document.getElementById("finished-tasks-table");

setupTable(table_body, completedOrders, false);

function getCompletedOrders(orders) {
    return orders.filter(order => {
        const order_comments = order.getComments();

        if (order.isRemoved()) return false;

        if (order_comments != null) {
            return (order_comments.toLowerCase().includes("valmis"));  
        } else {
            return false;
        }
    });
}