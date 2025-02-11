export class MalformedDataError extends Error {
    constructor(message) {
        super(message);
        this.name = "MalformedDataError";
    }
}

export default MalformedDataError;
