export function getRingIdString(ringName) {
    return ringName.replaceAll(/[^a-zA-Z0-9]/g, "-").toLowerCase();
}

export function replaceSpaceWithHyphens(anyString) {
    return anyString.trim().replace(/\s+/g, "-").toLowerCase();
}

export function removeAllSpaces(blipId) {
    return blipId.toString().replace(/\s+/g, "");
}
