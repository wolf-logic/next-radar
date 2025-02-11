import map from "lodash/map";
import uniqBy from "lodash/uniqBy";
import capitalize from "lodash/capitalize";
import each from "lodash/each";
import { MalformedDataError } from "@/lib/legacy/exceptions/malformedDataError";
import { ExceptionMessages } from "./exceptionMessages";

const _ = { map, uniqBy, capitalize, each };

export class ContentValidator {
    constructor(columnNames) {
        this.columnNames = columnNames.map(columnName => columnName.trim());
    }

    verifyContent() {
        if (this.columnNames.length === 0) {
            throw new MalformedDataError(ExceptionMessages.MISSING_CONTENT);
        }
    }

    verifyHeaders() {
        _.each([ "name", "ring", "quadrant", "status", "description" ], (field) => {
            if (this.columnNames.indexOf(field) === -1) {
                throw new MalformedDataError(ExceptionMessages.MISSING_HEADERS);
            }
        });
    }
}

export default ContentValidator;
