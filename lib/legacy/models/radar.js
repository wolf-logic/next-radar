import { MalformedDataError } from "@/lib/legacy/exceptions/malformedDataError";
import { ExceptionMessages } from "@/lib/legacy/util/exceptionMessages";

export class Radar {
    constructor() {
        this.blipNumber = 0;
        this.addingQuadrant = 0;
        this._quadrants = [  // Changed to _quadrants
            { order: "first", startAngle: 0 },
            { order: "second", startAngle: -90 },
            { order: "third", startAngle: 90 },
            { order: "fourth", startAngle: -180 },
        ];
        this.alternatives = [];
        this.currentSheetName = "";
        this._rings = {};
    }

    setNumbers(blips) {
        blips.forEach(blip => {
            ++this.blipNumber;
            blip.setBlipText(this.blipNumber);
            blip.setId(this.blipNumber);
        });
    }

    addAlternative(sheetName) {
        this.alternatives.push(sheetName);
    }

    getAlternatives() {
        return this.alternatives;
    }

    setCurrentSheet(sheetName) {
        this.currentSheetName = sheetName;
    }

    getCurrentSheet() {
        return this.currentSheetName;
    }

    addQuadrant(quadrant) {
        if (this.addingQuadrant >= 4) {
            throw new MalformedDataError(ExceptionMessages.TOO_MANY_QUADRANTS);
        }
        this._quadrants[this.addingQuadrant].quadrant = quadrant;
        this.setNumbers(quadrant.blips());
        this.addingQuadrant++;
    }

    addRings(allRings) {
        this._rings = allRings;
    }

    rings() {
        return this._rings;
    }

    quadrants() {
        return this._quadrants;  // Returns the _quadrants array
    }
}

export default Radar;
