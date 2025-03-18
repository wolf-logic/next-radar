import * as d3 from "d3";
import d3tip from "d3-tip";
import { each } from "lodash";
import { RingCalculator } from "@/lib/legacy/util/ringCalculator";
import { plotRadarBlips } from "./blips";
import { graphConfig, getGraphSize } from "./config";
import { renderQuadrantSubnav } from "./components/quadrantSubnav";
import { renderRadarQuadrants, renderRadarLegends, removeScrollListener } from "./components/quadrants";
import { renderQuadrantTables } from "./components/quadrantTables";
import { toRadian } from "@/lib/legacy/util/mathUtils";

const ANIMATION_DURATION = 1000;

export function GraphingRadar(size, radar, userSlug, radarSlug) {
  const CENTER = size / 2;
  let svg, radarElement;

  const tip = d3tip()
    .attr("class", "d3-tip")
    .html(function (text) {
      return text;
    });

  tip.direction(function () {
    return "n";
  });

  const ringCalculator = new RingCalculator(radar.rings().length, CENTER);

  const self = {};

  function plotLines(quadrantGroup, quadrant) {
    const startX = size * (1 - (-Math.sin(toRadian(quadrant.startAngle)) + 1) / 2);
    const endX = size * (1 - (-Math.sin(toRadian(quadrant.startAngle - 90)) + 1) / 2);

    let startY = size * (1 - (Math.cos(toRadian(quadrant.startAngle)) + 1) / 2);
    let endY = size * (1 - (Math.cos(toRadian(quadrant.startAngle - 90)) + 1) / 2);

    if (startY > endY) {
      const aux = endY;
      endY = startY;
      startY = aux;
    }
    const strokeWidth = graphConfig.quadrantsGap;

    quadrantGroup
      .append("line")
      .attr("x1", CENTER)
      .attr("y1", startY)
      .attr("x2", CENTER)
      .attr("y2", endY)
      .attr("stroke-width", strokeWidth);

    quadrantGroup
      .append("line")
      .attr("x1", endX)
      .attr("y1", CENTER)
      .attr("x2", startX)
      .attr("y2", CENTER)
      .attr("stroke-width", strokeWidth);
  }

  function plotRingNames(quadrantGroup, rings, quadrant) {
    rings.forEach(function (ring, i) {
      const ringNameWithEllipsis = ring.name().length > 6 ? ring.name().slice(0, 6) + "..." : ring.name();
      if (quadrant.order === "third" || quadrant.order === "fourth") {
        quadrantGroup
          .append("text")
          .attr("class", "line-text")
          .attr("y", CENTER + 5)
          .attr("x", CENTER + (ringCalculator.getRingRadius(i) + ringCalculator.getRingRadius(i + 1)) / 2)
          .attr("text-anchor", "middle")
          .text(ringNameWithEllipsis);
      } else {
        quadrantGroup
          .append("text")
          .attr("class", "line-text")
          .attr("y", CENTER + 5)
          .attr("x", CENTER - (ringCalculator.getRingRadius(i) + ringCalculator.getRingRadius(i + 1)) / 2)
          .attr("text-anchor", "middle")
          .text(ringNameWithEllipsis);
      }
    });
  }

  function renderFullRadar() {
    removeScrollListener();

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });

    d3.select("#radar-plot").classed("quadrant-view", false);
    d3.select("#radar-plot").classed("enable-transition", true);

    d3.select("#radar-plot").attr("data-quadrant-selected", null);

    const size = getGraphSize();
    d3.select(".home-link").remove();
    d3.select(".legend").remove();

    d3.select("li.quadrant-subnav__list-item.active-item").classed("active-item", false);
    d3.select("li.quadrant-subnav__list-item").classed("active-item", true);

    d3.select(".quadrant-subnav__dropdown-selector").text("All quadrants");

    d3tip()
      .attr("class", "d3-tip")
      .html(function (text) {
        return text;
      })
      .hide();

    d3.selectAll("g.blip-link").attr("opacity", 1.0);

    svg.style("left", 0).style("right", 0).style("top", 0).attr("transform", "scale(1)").style("transform", "scale(1)");

    d3.selectAll(".button").classed("selected", false).classed("full-view", true);

    d3.selectAll(".quadrant-table").classed("selected", false);
    d3.selectAll(".home-link").classed("selected", false);

    d3.selectAll(".quadrant-group")
      .style("display", "block")
      .transition()
      .duration(ANIMATION_DURATION)
      .style("transform", "scale(1)")
      .style("opacity", "1")
      .attr("transform", "translate(0,0)");

    d3.select("#radar-plot").attr("width", size).attr("height", size);
    d3.select(`svg#radar-plot`).style("padding", "0");

    const radarLegendsContainer = d3.select(".radar-legends");
    radarLegendsContainer.attr("class", "radar-legends");
    radarLegendsContainer.attr("style", null);

    d3.selectAll("svg#radar-plot a").attr("aria-hidden", null).attr("tabindex", null);
    d3.selectAll(".quadrant-table button").attr("aria-hidden", "true").attr("tabindex", -1);
    d3.selectAll(".blip-list__item-container__name").attr("aria-expanded", "false");

    d3.selectAll(`.quadrant-group rect:nth-child(2n)`).attr("tabindex", 0);
  }

  function hideTooltipOnScroll(tip) {
    window.addEventListener("scroll", () => {
      tip.hide().style("left", 0).style("top", 0);
    });
  }

  self.init = function () {
    radarElement = d3.select("#radar");
    return self;
  };

  self.plot = function () {
    var rings, quadrants;

    rings = radar.rings();
    quadrants = radar.quadrants();

    const radarHeader = d3.select("main .graph-header");

    renderQuadrantSubnav(radarHeader, quadrants, renderFullRadar);

    // Add "Add item" button to the header if userSlug and radarSlug are provided
    if (userSlug && radarSlug) {
      const addButtonContainer = radarHeader
        .append("div")
        .classed("header-add-button-container", true)
        .style("position", "absolute")
        .style("right", "60px")
        .style("top", "16px")
        .style("display", "flex")
        .style("align-items", "center");

      const addButton = addButtonContainer
        .append("button")
        .classed("header-add-button", true)
        .attr("title", "Add new radar entry")
        .attr("aria-label", "Add new radar entry")
        .style("border", "1px solid #ccc")
        .style("border-radius", "50%")
        .style("width", "28px")
        .style("height", "28px")
        .style("background-color", "white")
        .style("cursor", "pointer")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .on("click", function () {
          if (typeof window !== "undefined" && window.next && window.next.router) {
            // Use Next.js router if available
            window.next.router.push(`/${userSlug}/${radarSlug}/entries/new`);
          } else {
            // Fallback to window.location for client-side navigation
            window.location.href = `/${userSlug}/${radarSlug}/entries/new`;
          }
        });

      // Add plus icon to button
      addButton
        .append("svg")
        .attr("width", "16")
        .attr("height", "16")
        .attr("viewBox", "0 0 24 24")
        .attr("fill", "none")
        .attr("stroke", "currentColor")
        .attr("stroke-width", "2")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .html('<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>');
    }

    renderQuadrantTables(quadrants, rings);

    const landingPageElements = document.querySelectorAll("main .home-page");
    landingPageElements.forEach(elem => {
      elem.style.display = "none";
    });

    svg = radarElement.append("svg").call(tip);

    // const legendHeight = 40;
    // radarElement.style("height", size + legendHeight + "px");
    svg.attr("id", "radar-plot").attr("width", size).attr("height", size);

    each(quadrants, function (quadrant) {
      // Skip quadrants that don't have valid properties
      if (quadrant.quadrant && typeof quadrant.quadrant.name === "function") {
        let quadrantGroup;
        quadrantGroup = renderRadarQuadrants(size, svg, quadrant, rings, ringCalculator, tip);
        plotLines(quadrantGroup, quadrant);
        const ringTextGroup = quadrantGroup.append("g");
        plotRingNames(ringTextGroup, rings, quadrant);
        plotRadarBlips(quadrantGroup, rings, quadrant, tip, userSlug, radarSlug);
      }
    });

    renderRadarLegends(radarElement, hasMovementData(quadrants));
    hideTooltipOnScroll(tip);
  };

  function hasMovementData(quadrants) {
    for (var quadrantWrapper of quadrants) {
      // Skip if quadrant is undefined or doesn't have the expected properties
      if (!quadrantWrapper.quadrant || typeof quadrantWrapper.quadrant.blips !== "function") {
        continue;
      }

      let quadrant = quadrantWrapper.quadrant;

      for (var blip of quadrant.blips()) {
        if (blip.status() !== "") {
          return true;
        }
      }
    }

    return false;
  }

  return self;
}

export default GraphingRadar;
