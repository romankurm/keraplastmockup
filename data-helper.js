import {Order} from "./Order.js"

export async function getOrders() {
    const url = "https://keraplast.prodcell.com/api/objects/Order?limit=1000";

    let response = await fetch(url, {
        method: "GET",
        headers: {
            "X-API-KEY": "nW1gnRO8SUWVuqhGN5V9xH05PiGTNtdl"
        }
    })

    let responseJSON = await response.json();

    let data = responseJSON.data;

    let orders = [];

    for (let order of data) {
        let t_nr = order.number;
        let material = order.material;
        let so_nr = order.invoiceNumber;
        let client = order.clientName;
        let task = order.productSpec;
        let amount = order.productQuantity;
        let comments = order.comments;
        let state = "";
        let status = order.status;
        let completion_date = null;

        let ordr = new Order(t_nr, material, so_nr, client, "",  task, Math.floor(amount), state, status, completion_date, comments);

        orders.push(ordr);
    }
    return orders;
}