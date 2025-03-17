import * as d3 from "d3";
import map from "lodash/map";
import uniqBy from "lodash/uniqBy";
import each from "lodash/each";
import InputSanitizer from "./inputSanitizer.js";
import Radar from "@/lib/legacy/models/radar.js";
import Quadrant from "@/lib/legacy/models/quadrant.js";
import Ring from "@/lib/legacy/models/ring.js";
import Blip from "@/lib/legacy/models/blip.js";
import { GraphingRadar } from "@/lib/legacy/graphing/radar";
import ContentValidator from "./contentValidator.js";
import { getGraphSize, graphConfig, isValidConfig, setConfig } from "@/lib/legacy/graphing/config";

const _ = { map, uniqBy, each };

function plotRadarGraph(title, blips, currentRadarName, alternativeRadars, userSlug, radarSlug) {
  if (typeof document !== "undefined") {
    if (title) document.title = title;
    d3.selectAll(".loading").remove();

    // Create the ring objects
    const ringMap = graphConfig.rings.reduce((allRings, ringName, index) => {
      allRings[ringName] = new Ring(ringName, index);
      return allRings;
    }, {});

    // Create the quadrant objects
    const quadrants = {};
    graphConfig.quadrants.forEach(quadrantName => {
      // Only create quadrants for those with names
      if (quadrantName && quadrantName.trim() !== '') {
        quadrants[quadrantName] = new Quadrant(quadrantName);
      }
    });

    // Add blips to appropriate quadrants
    blips.forEach(blip => {
      const currentQuadrant = blip.quadrant;
      const ring = blip.ring;

      // Only add blips if both the quadrant and ring exist and the quadrant is valid
      if (currentQuadrant && ring && quadrants[currentQuadrant]) {
        const blipObj = new Blip(
          blip.id,
          blip.name,
          ringMap[ring],
          blip.status?.toLowerCase() === "new",
          blip.status,
          blip.topic,
          blip.description
        );
        
        quadrants[currentQuadrant].add(blipObj);
      }
    });

    const radar = new Radar();
    radar.addRings(Object.values(ringMap));

    _.each(quadrants, function (quadrant) {
      radar.addQuadrant(quadrant);
    });

    alternativeRadars.forEach(function (sheetName) {
      radar.addAlternative(sheetName);
    });

    radar.setCurrentSheet(currentRadarName);

    const graphingRadar = new GraphingRadar(getGraphSize(), radar, userSlug, radarSlug);
    graphingRadar.init().plot();
  }
}

export class Factory {
  build(data, config = {}, userSlug, radarSlug) {
    // Update the configuration with provided values
    setConfig(config);

    if (!isValidConfig()) {
      console.error("Invalid configuration");
      return;
    }

    try {
      const columnNames = Object.keys(data[0] || {});

      if (columnNames.length > 0) {
        // NOTE: Content validator requires column names otherwise it is redundant
        const contentValidator = new ContentValidator(columnNames);
        contentValidator.verifyContent();
        contentValidator.verifyHeaders();
      }

      const sanitizer = new InputSanitizer();
      const blips = data.map(item => sanitizer.sanitize(item));

      plotRadarGraph(undefined, blips, undefined, [], userSlug, radarSlug);
    } catch (error) {
      console.error("Error building radar:", error.stack);
      throw error;
    }
  }
}

export default Factory;
