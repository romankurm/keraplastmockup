export function setupTable(table_body, orders, isMainTable) {
    for (const order of orders) {
    
            let table_row = document.createElement("tr");
    
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

            if (order.status == "done") {
                td_valmis.innerHTML = '<i data-lucide="circle-check" color="green"></i>';
            }

            if (order.status == "problematic") {
                td_puudused.innerHTML = '<i data-lucide="circle-alert" color="red"></i>'
            }

            table_row.appendChild(td_valmis);
            table_row.appendChild(td_puudused);
    
            table_body.appendChild(table_row);
    }
    lucide.createIcons();
}