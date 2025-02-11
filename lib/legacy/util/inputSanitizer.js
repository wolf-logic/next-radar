import sanitizeHtml from "sanitize-html";
import forOwn from "lodash/forOwn";

export class InputSanitizer {
    constructor() {
        this.relaxedOptions = {
            allowedTags: [ "b", "i", "em", "strong", "a", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul", "br", "p", "u" ],
            allowedAttributes: {
                a: [ "href", "target", "rel" ],
            },
        };

        this.restrictedOptions = {
            allowedTags: [],
            allowedAttributes: {},
            textFilter: function (text) {
                return text.replace(/&amp;/, "&");
            },
        };
    }

    trimWhiteSpaces(blip) {
        const processedBlip = {};
        forOwn(blip, (value, key) => {
            processedBlip[key.trim()] = value.trim();
        });
        return processedBlip;
    }

    sanitize(rawBlip) {
        const blip = this.trimWhiteSpaces(rawBlip);
        blip.description = sanitizeHtml(blip.description, this.relaxedOptions);
        blip.name = sanitizeHtml(blip.name, this.restrictedOptions);
        blip.status = sanitizeHtml(blip.status, this.restrictedOptions);
        blip.ring = sanitizeHtml(blip.ring, this.restrictedOptions);
        blip.quadrant = sanitizeHtml(blip.quadrant, this.restrictedOptions);

        return blip;
    }
}

export default InputSanitizer;
