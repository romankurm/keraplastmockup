    import { orders } from "./orders-data.js";
    import { setupTable } from "./table-helper.js";
    import { addRow } from "./table-helper.js";
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

async function updateMainTable() {
    console.log("Updating main table...");
    const currentOrders = Order.currentOrders.filter((order) => !order.isRemoved() && !order.containsComment("valmis"));

    const newOrders = await getSortedOrders();

    let table_body = document.getElementById("tableBody");

    if (currentOrders.length < newOrders.length) {
        for (let i = currentOrders.length; i < newOrders.length; ++i) {

            const newOrder = newOrders[i];

            console.log(`Found new order: ${newOrder.getT_nr()}`);
        
            Order.currentOrders.push(newOrder);

            addRow(table_body, newOrder, true);

        }
    }
}

async function removeJunk(order) {
    if (order.isRemoved() || order.containsComment("valmis"))
        document.getElementById(order.getT_nr()).remove();
}