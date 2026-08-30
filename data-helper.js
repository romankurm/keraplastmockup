import {Order} from "./Order.js"

const API_BASE = "https://keraplast.prodcell.com/api";
const API_KEY = "nW1gnRO8SUWVuqhGN5V9xH05PiGTNtdl";

// The operation columns this board draws, in running order. Prodcell stores the
// code as Operation.id, so a task's operation reads back as the letter itself.
const OPERATIONS = ["L", "N", "P", "K"];

// Prodcell task statuses that count as finished: Y done, Z accepted.
const DONE_STATUSES = ["Y", "Z"];

const PAGE_SIZE = 1000;
const MAX_PAGES = 50;

async function apiGet(path) {
    const response = await fetch(`${API_BASE}${path}`, {
        method: "GET",
        headers: {
            "X-API-KEY": API_KEY,
            "Accept": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`GET ${path} failed: ${response.status}`);
    }

    return await response.json();
}

/**
 * Which operations are finished, per order guid.
 *
 * Read one operation at a time and paged to the server's own total: a single
 * unpaged read silently stops at the API row cap, and a task that drops out of
 * the answer would show up here as an operation that is not done yet.
 */
async function getDoneOperationsByOrder() {
    const done = new Map();

    for (const operationId of OPERATIONS) {
        let page = 1;
        let fetched = 0;
        let total = Infinity;

        while (fetched < total && page <= MAX_PAGES) {
            const json = await apiGet(
                `/tasks?limit=${PAGE_SIZE}&page=${page}&sortField=guid&sortOrder=ASC&operation=${encodeURIComponent(operationId)}`
            );

            const rows = json.data || [];
            const reported = Number(json.total);
            total = Number.isFinite(reported) ? reported : rows.length;

            for (const task of rows) {
                if (!task.order) continue;
                if (!DONE_STATUSES.includes(task.status)) continue;

                if (!done.has(task.order)) done.set(task.order, new Set());
                done.get(task.order).add(operationId);
            }

            fetched += rows.length;
            if (!rows.length) break;
            page++;
        }
    }

    return done;
}

export async function getOrders() {
    const url = `${API_BASE}/objects/Order?limit=1000`;

    let response = await fetch(url, {
        method: "GET",
        headers: {
            "X-API-KEY": API_KEY
        }
    })

    let responseJSON = await response.json();

    let data = responseJSON.data;

    // A board on a wall must keep showing the work even when this extra call
    // fails, so a failure here costs the tick marks and nothing else.
    let doneByOrder = new Map();
    try {
        doneByOrder = await getDoneOperationsByOrder();
    } catch (e) {
        console.warn("Operatsioonide seisu ei saadud:", e.message);
    }

    let orders = [];

    for (let order of data) {
        let t_nr = order.number;
        let material = order.material;
        let so_nr = order.invoiceNumber;
        let client = order.clientName;
        let task = order.productSpec;
        let amount = order.productQuantity;
        let comments = order.comments;
        // The renderer tests state.includes("l"), "n", "p", "k", so this is the
        // finished operations as lower case letters in running order.
        let doneOps = doneByOrder.get(order.guid);
        let state = doneOps
            ? OPERATIONS.filter(op => doneOps.has(op)).join("").toLowerCase()
            : "";
        let status = order.status;
        let completion_date = null;

        let ordr = new Order(t_nr, material, so_nr, client, "",  task, Math.floor(amount), state, status, completion_date, comments);

        orders.push(ordr);
    }
    return orders;
}
