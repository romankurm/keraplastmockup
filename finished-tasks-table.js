import { orders } from "./orders-data.js";
import { setupTable } from "./table-helper.js";

const today = new Date().toISOString().split("T")[0];

let completedToday = orders.filter(order => order.status == "done");

let table_body = document.getElementById("finished-tasks-table");

setupTable(table_body, completedToday, false);