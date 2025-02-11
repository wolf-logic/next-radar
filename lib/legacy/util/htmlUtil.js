export function getElementWidth(element) {
    return element.node().getBoundingClientRect().width;
}

export function decodeHTML(encodedText) {
    const parser = new DOMParser();
    return parser.parseFromString(encodedText, "text/html").body.textContent;
}

export function getElementHeight(element) {
    return element.node().getBoundingClientRect().height;
}
