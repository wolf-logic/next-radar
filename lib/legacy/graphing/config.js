const quadrantSize = 512;
const quadrantGap = 32;

// Configuration context to store the current config
let currentConfig = {
    rings: [ "Adopt", "Trial", "Assess", "Hold" ],
    quadrants: [ "Techniques", "Platforms", "Tools", "Languages & Frameworks" ]
};

export function setConfig(config) {
    if (config.rings) currentConfig.rings = config.rings;
    if (config.quadrants) currentConfig.quadrants = config.quadrants;
}

export function getQuadrants() {
    return currentConfig.quadrants;
}

export function getRings() {
    return currentConfig.rings;
}

function isBetween(number, startNumber, endNumber) {
    return startNumber <= number && number <= endNumber;
}

export function isValidConfig() {
    return getQuadrants().length === 4 && isBetween(getRings().length, 1, 4);
}

export const graphConfig = {
    effectiveQuadrantHeight: quadrantSize + quadrantGap / 2,
    effectiveQuadrantWidth: quadrantSize + quadrantGap / 2,
    quadrantHeight: quadrantSize,
    quadrantWidth: quadrantSize,
    quadrantsGap: quadrantGap,
    blipWidth: 22,
    groupBlipHeight: 24,
    newGroupBlipWidth: 88,
    existingGroupBlipWidth: 124,
    get rings() {
        return getRings();
    },
    get quadrants() {
        return getQuadrants();
    },
    groupBlipAngles: [ 30, 35, 60, 80 ],
    maxBlipsInRings: [ 8, 22, 17, 18 ],
};

export const uiConfig = {
    subnavHeight: 60,
    legendsHeight: 42,
    tabletViewWidth: 1280,
    mobileViewWidth: 768,
};

export function getScale() {
    return window.innerWidth < 1800 ? 1.25 : 1.5;
}

export function getGraphSize() {
    return graphConfig.effectiveQuadrantHeight + graphConfig.effectiveQuadrantWidth;
}

export function getScaledQuadrantWidth(scale) {
    return graphConfig.quadrantWidth * scale;
}

export function getScaledQuadrantHeightWithGap(scale) {
    return (graphConfig.quadrantHeight + graphConfig.quadrantsGap) * scale;
}