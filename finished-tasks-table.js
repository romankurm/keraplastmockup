import { setupTable } from "./table-helper.js";
import { getOrders } from "./data-helper.js"

const today = new Date().toISOString().split("T")[0];

let orders = await getOrders();

let completedToday = orders.filter(order => order.status == "done");

let table_body = document.getElementById("finished-tasks-table");

setupTable(table_body, completedToday, false);