import { Order } from "./Order.js";

export function setupTable(table_body, orders, isMainTable) {

    const ordersCopy = Array.from(orders);

    if (isMainTable) {

        for (let order of ordersCopy) {

            const order_comments = order.getComments();

            if (order_comments != null) {
                const properties = order_comments.split(" ");

                for (const property of properties) {
                    if (property.toLowerCase() == "p") {

                        orders.splice(orders.indexOf(order), 1);
                        orders.splice(0, 0, order);

                    } else if (property.toLowerCase() == "valmis") {
                        orders.splice(orders.indexOf(order), 1);
                    }
                }
            }

        }
    }

    for (const order of orders) {
        addRow(table_body, order, isMainTable);
    }
    lucide.createIcons();
}

export function addRow(table_body, order, isMainTable) {

            if (order.getStatus() != null) {
                if (order.getStatus().toLowerCase() == "x")
                    return;
            }

            if (order.containsComment("valmis") && isMainTable)
                return;

            let table_row = document.createElement("tr");
            table_row.id = `${order.getT_nr()}`;
    
            if (order.status == "active") {
                table_row.classList.add("status-active");
            } else if (order.status == "done") {
                table_row.classList.add("status-done");
            } else if (order.status == "problematic") {
                table_row.classList.add("status-problematic");
            }
    
            let c_o = !order.object
                ? order.client
                : `${order.client} / ${order.object}`;
    
            let o_table_obj = {
                t_nr: order.t_nr,
                material: order.material,
                so_nr: order.so_nr,
                client_obect: c_o,
                order_task: order.task,
                amount: order.amount,
            }
    
            for (let key in o_table_obj) {
                let table_td = document.createElement("td");
                table_td.innerHTML = o_table_obj[key];
                table_row.appendChild(table_td);
            }
    

            if (isMainTable) {
                for (const char of "lnpk") {
                    let state_td = document.createElement("td");
                    if (order.state.includes(char)) {
                        /*
                        let td_div_done = document.createElement("div");
                        td_div_done.classList.add("td-done");
                        state_td.appendChild(td_div_done);
                        */
                    state_td.innerHTML = '<i data-lucide="circle-check" color="green"></i>'
                    }
                    table_row.appendChild(state_td);
                }
            }
    
            // VALMIS, PUUDUSED ON DUMMYD SEST MAI OSKA SIIA MIDAGI PANNA HETKEL
            let td_valmis = document.createElement("td");
            let td_puudused = document.createElement("td");

            if (!isMainTable) {
                td_valmis.innerHTML = '<i data-lucide="circle-check" color="green"></i>';
            }

            if (order.status == "problematic") {
                td_puudused.innerHTML = '<i data-lucide="circle-alert" color="red"></i>'
            }

            table_row.appendChild(td_valmis);
            table_row.appendChild(td_puudused);
    
            table_body.appendChild(table_row);

}