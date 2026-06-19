    import { orders } from "./orders-data.js";
    import { setupTable } from "./table-helper.js";
    import { getOrders } from "./data-helper.js"

    let ordrs = await getOrders();

    const sortedOrders = ordrs
        .filter(order => order.status != "done")
        .filter(order => order.so_nr != null)
        .filter(order => order.task != null);

    let table_body = document.getElementById("tableBody");

    setupTable(table_body, sortedOrders, true);
