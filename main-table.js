    import { orders } from "./orders-data.js";
    import { setupTable } from "./table-helper.js";

    const sortedOrders = orders.toSorted((a, b) => {
        const priority = {
            active: 1,
            problematic: 2,
            done: 3
        };

        return priority[a.status] - priority[b.status];
    })
    .filter(order => order.status != "done");

    let table_body = document.getElementById("tableBody");

    setupTable(table_body, sortedOrders, true);
