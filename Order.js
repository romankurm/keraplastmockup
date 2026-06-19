/*

{
        t_nr: "T1221",
        material: "P",
        so_nr: 4042,
        client: "EhitusFirma",
        object: "Ehitusplats",
        order_task: "23/01: 1200*2400 750/70 RR20/Zn",
        amount: 5,
        state: "lnpk",
        status: "active",
        completion_date: null
    },
*/

export class Order {
    constructor(t_nr, material, so_nr, client, object, task, amount, state, status) {
        this.t_nr = t_nr;
        this.material = material;
        this.so_nr = so_nr;
        this.client = client;
        this.object = object;
        this.task = task;
        this.amount = amount;
        this.state = state;
        this.status =status;
        this.completion_date = null;
    }

    getT_nr() {
        return this.t_nr;
    }

    getMaterial() {
        return this.material;
    }

    getSo_nr() {
        return this.so_nr;
    }

    getClient() {
        return this.client;
    }

    getObject() {
        return this.object;
    }

    getTask() {
        return this.task;
    }

    getAmount() {
        return this.amount;
    }

    getState() {
        return this.state;
    }

    getStatus() {
        return this.status;
    }

    getCompletionDate() {
        return this.completion_date;
    }

    setT_nr(t_nr) {
        this.t_nr = t_nr;
    }

    setMaterial(material) {
        this.material = material;
    }

    setSo_nr(so_nr) {
        this.so_nr = so_nr;
    }

    setClient(client) {
        this.client = client;
    }

    setObject(object) {
        this.object = object;
    }

    setTask(task) {
        this.task = task;
    }

    setAmount(amount) {
        this.amount = amount;
    }

    setState(state) {
        this.state = state;
    }

    setStatus(status) {
        this.status = status;
    }

    setCompletionDate(date) {
        this.completion_date = date;
    }

};