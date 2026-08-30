import {Order} from "./Order.js"

const API_BASE = "https://keraplast.prodcell.com/api";
const API_KEY = "nW1gnRO8SUWVuqhGN5V9xH05PiGTNtdl";

// Which table column each production operation lights up. Kept as an explicit
// pair rather than a string of letters: a state string tested with includes()
// would let an operation id like "LOIK" tick the K column too.
const OPERATION_COLUMNS = [
    { column: "l", operationId: "L" },
    { column: "n", operationId: "N" },
    { column: "p", operationId: "P" },
    { column: "k", operationId: "K" },
];

// Prodcell task statuses: Y done, Z accepted, X cancelled.
const DONE_STATUSES = ["Y", "Z"];
const CANCELLED_STATUS = "X";

// The API caps a page at 10000. Reading in full pages keeps the request count
// down; the page ceiling only exists so a broken total cannot spin forever.
const PAGE_SIZE = 10000;
const MAX_PAGES = 50;

const REQUEST_TIMEOUT_MS = 15000;

// Two independent 10s loops on the same screen ask for orders, and only one of
// them needs the operation state. One short-lived snapshot serves both, and a
// scan already in flight is joined rather than started again.
const SNAPSHOT_TTL_MS = 5000;

let doneSnapshot = { at: 0, value: new Map(), everLoaded: false };
let doneInFlight = null;

async function apiGet(path) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${API_BASE}${path}`, {
            method: "GET",
            headers: {
                "X-API-KEY": API_KEY,
                "Accept": "application/json"
            },
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`GET ${path} failed: ${response.status}`);
        }

        return await response.json();
    } finally {
        clearTimeout(timer);
    }
}

/**
 * The finished operations of every order, as a Set of column letters.
 *
 * One order and operation can own several tasks over time, because finishing an
 * operation and then reopening it for a redo creates a new one. The newest task
 * that is not cancelled is the one that counts, so a redo takes the tick mark
 * back off until it is finished again. Rows arrive in guid ASC order and Prodcell
 * guids are time ordered, so the last one seen wins.
 */
async function fetchDoneColumnsByOrder() {
    const currentStatus = new Map();

    for (const { column, operationId } of OPERATION_COLUMNS) {
        let page = 1;
        let fetched = 0;
        let total = Infinity;

        while (fetched < total && page <= MAX_PAGES) {
            const json = await apiGet(
                `/tasks?limit=${PAGE_SIZE}&page=${page}&sortField=guid&sortOrder=ASC&operation=${encodeURIComponent(operationId)}`
            );

            // A 200 carrying something that is not a task page is not a usable
            // answer, and treating it as an empty one would publish a snapshot
            // with every mark missing. Refusing it here sends the caller to the
            // last state that did arrive.
            if (!json || !Array.isArray(json.data)) {
                throw new Error(`Operatsiooni ${operationId} vastuses ei ole taskide massiivi`);
            }
            const rows = json.data;

            const reported = Number(json.total);
            if (!Number.isFinite(reported)) {
                throw new Error(`Operatsiooni ${operationId} vastuses ei ole kasutatavat total-i`);
            }
            total = reported;

            for (const task of rows) {
                if (!task || !task.order) continue;
                if (task.status === CANCELLED_STATUS) continue;

                if (!currentStatus.has(task.order)) currentStatus.set(task.order, new Map());
                currentStatus.get(task.order).set(column, task.status);
            }

            fetched += rows.length;
            if (!rows.length) break;
            page++;
        }

        // Short of the total means the page ceiling cut the read off. The rows
        // that were missed would read as operations nobody has finished, so the
        // snapshot is refused rather than shown with holes in it.
        if (fetched < total) {
            throw new Error(`Operatsioonist ${operationId} loeti ${fetched} taski ${total}-st, seis on puudulik`);
        }
    }

    const done = new Map();
    for (const [orderGuid, byColumn] of currentStatus) {
        const columns = new Set();
        for (const [column, status] of byColumn) {
            if (DONE_STATUSES.includes(status)) columns.add(column);
        }
        if (columns.size) done.set(orderGuid, columns);
    }

    return done;
}

async function getDoneColumnsByOrder() {
    if (Date.now() - doneSnapshot.at < SNAPSHOT_TTL_MS) {
        return doneSnapshot.value;
    }
    if (doneInFlight) {
        return await doneInFlight;
    }

    doneInFlight = (async () => {
        try {
            const value = await fetchDoneColumnsByOrder();
            doneSnapshot = { at: Date.now(), value, everLoaded: true };
            return value;
        } finally {
            doneInFlight = null;
        }
    })();

    return await doneInFlight;
}

export async function getOrders() {
    const responseJSON = await apiGet(`/objects/Order?limit=1000`);

    let data = Array.isArray(responseJSON && responseJSON.data) ? responseJSON.data : [];

    // A board on a wall must keep showing the work. If the operation scan fails
    // the last state we did get is reused rather than blanking every tick mark
    // over one bad request.
    let doneByOrder = doneSnapshot.value;
    try {
        doneByOrder = await getDoneColumnsByOrder();
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
        // The renderer tests state.includes("l"|"n"|"p"|"k").
        let doneColumns = doneByOrder.get(order.guid);
        let state = doneColumns
            ? OPERATION_COLUMNS.filter(o => doneColumns.has(o.column)).map(o => o.column).join("")
            : "";
        let status = order.status;
        let completion_date = null;

        let ordr = new Order(t_nr, material, so_nr, client, "",  task, Math.floor(amount), state, status, completion_date, comments);

        orders.push(ordr);
    }
    return orders;
}
