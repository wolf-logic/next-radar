export class RingCalculator {
    constructor(numberOfRings, maxRadius) {
        this.numberOfRings = numberOfRings;
        this.maxRadius = maxRadius;
        this.sequence = [ 0, 6, 5, 3, 2, 1, 1, 1 ];
    }

    sum(length) {
        return this.sequence.slice(0, length + 1).reduce((previous, current) => {
            return previous + current;
        }, 0);
    }

    getRadius(ring) {
        const total = this.sum(this.numberOfRings);
        const sum = this.sum(ring);
        return (this.maxRadius * sum) / total;
    }

    getRingRadius(ringIndex) {
        const ratios = [ 0, 0.316, 0.652, 0.832, 1 ];
        const radius = ratios[ringIndex] * this.maxRadius;
        return radius || 0;
    }
}

export default RingCalculator;
