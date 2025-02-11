export class Quadrant {
    constructor(name) {
        this.quadrantName = name;
        this._blips = [];  // Changed to _blips to avoid name collision with method
    }

    name() {
        return this.quadrantName;
    }

    add(newBlips) {
        if (Array.isArray(newBlips)) {
            this._blips = this._blips.concat(newBlips);
        } else {
            this._blips.push(newBlips);
        }
    }

    blips() {
        return this._blips.slice(0);
    }
}

export default Quadrant;
