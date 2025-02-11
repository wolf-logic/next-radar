export class Ring {
    constructor(name, order) {
        this._name = name;
        this._order = order;
    }

    name() {
        return this._name;
    }

    order() {
        return this._order;
    }
}

export default Ring;
