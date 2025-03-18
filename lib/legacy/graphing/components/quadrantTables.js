import * as d3 from "d3";
import { graphConfig, getScale, uiConfig } from "../config";
import { stickQuadrantOnScroll } from "./quadrants";
import { removeAllSpaces } from "@/lib/legacy/util/stringUtil";
import { convertMarkdown } from "@/lib/markdown";

function fadeOutAllBlips() {
  d3.selectAll("g > a.blip-link").attr("opacity", 0.3);
}

function fadeInSelectedBlip(selectedBlipOnGraph) {
  selectedBlipOnGraph.attr("opacity", 1.0);
}

function highlightBlipInTable(selectedBlip) {
  selectedBlip.classed("highlight", true);
}

function highlightBlipInGraph(blipIdToFocus) {
  fadeOutAllBlips();
  const selectedBlipOnGraph = d3.select(`g > a.blip-link[data-blip-id='${blipIdToFocus}'`);
  fadeInSelectedBlip(selectedBlipOnGraph);
}

export function renderBlipDescription(blip, ring, quadrant, tip, groupBlipTooltipText, userSlug, radarSlug) {
  let blipTableItem = d3.select(`.quadrant-table.${quadrant.order} ul[data-ring-order='${ring.order()}']`);
  if (!groupBlipTooltipText) {
    blipTableItem = blipTableItem.append("li").classed("blip-list__item", true);
    const blipItemDiv = blipTableItem
      .append("div")
      .classed("blip-list__item-container", true)
      .attr("data-blip-id", blip.id());

    if (blip.groupIdInGraph()) {
      blipItemDiv.attr("data-group-id", blip.groupIdInGraph());
    }

    const blipItemContainer = blipItemDiv
      .append("button")
      .classed("blip-list__item-container__name", true)
      .attr("aria-expanded", "false")
      .attr("aria-controls", `blip-description-${blip.id()}`)
      .attr("aria-hidden", "true")
      .attr("tabindex", -1)
      .on("click", function (e) {
        e.stopPropagation();

        const expandFlag = d3.select(e.target.parentElement).classed("expand");

        d3.selectAll(".blip-list__item-container.expand").classed("expand", false);
        d3.select(e.target.parentElement).classed("expand", !expandFlag);

        d3.selectAll(".blip-list__item-container__name").attr("aria-expanded", "false");
        d3.select(".blip-list__item-container.expand .blip-list__item-container__name").attr("aria-expanded", "true");

        if (window.innerWidth >= uiConfig.tabletViewWidth) {
          stickQuadrantOnScroll();
        }
      });

    blipItemContainer
      .append("span")
      .classed("blip-list__item-container__name-value", true)
      .text(`${blip.blipText()}. ${blip.name()}`);

    // Add edit button if userSlug and radarSlug are provided
    if (userSlug && radarSlug && typeof blip.isGroup === "function" && !blip.isGroup()) {
      const editButton = blipItemContainer
        .append("button")
        .classed("blip-list__item-container__name-edit-button", true)
        .attr("title", "Edit this radar entry")
        .attr("aria-label", `Edit ${blip.name()}`)
        .attr("data-url", `/${userSlug}/${radarSlug}/entries/${blip.id()}/`)
        .html(
          '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>'
        )
        .on("click", function (e) {
          e.stopPropagation();
          if (typeof window !== "undefined" && window.next && window.next.router) {
            // Use Next.js router if available
            const url = d3.select(this).attr("data-url");
            window.next.router.push(url);
          } else {
            // Fallback to window.location for client-side navigation
            const url = d3.select(this).attr("data-url");
            window.location.href = url;
          }
        });

      // Ensure edit button isn't affected by the pointer-events rule
      editButton.style("pointer-events", "auto");
    }

    blipItemContainer.append("span").classed("blip-list__item-container__name-arrow", true);

    blipItemDiv
      .append("div")
      .classed("blip-list__item-container__description", true)
      .attr("id", `blip-description-${blip.id()}`)
      .html(convertMarkdown(blip.description()));
  }
  const blipGraphItem = d3.select(`g a#blip-link-${removeAllSpaces(blip.id())}`);
  const mouseOver = function (e) {
    const targetElement = e.target.classList.contains("blip-link") ? e.target : e.target.parentElement;
    const isGroupIdInGraph = !targetElement.classList.contains("blip-link") ? true : false;
    const blipWrapper = d3.select(targetElement);
    const blipIdToFocus = blip.groupIdInGraph() ? blipWrapper.attr("data-group-id") : blipWrapper.attr("data-blip-id");
    const selectedBlipOnGraph = d3.select(`g > a.blip-link[data-blip-id='${blipIdToFocus}'`);
    highlightBlipInGraph(blipIdToFocus);
    highlightBlipInTable(blipTableItem);

    const isQuadrantView = d3.select("svg#radar-plot").classed("quadrant-view");
    const displayToolTip = blip.isGroup() ? !isQuadrantView : !blip.groupIdInGraph();
    const toolTipText = blip.isGroup() ? groupBlipTooltipText : blip.name();

    if (displayToolTip && !isGroupIdInGraph) {
      tip.show(toolTipText, selectedBlipOnGraph.node());

      const selectedBlipCoords = selectedBlipOnGraph.node().getBoundingClientRect();

      const tipElement = d3.select("div.d3-tip");
      const tipElementCoords = tipElement.node().getBoundingClientRect();

      tipElement
        .style(
          "left",
          `${parseInt(
            selectedBlipCoords.left + window.scrollX - tipElementCoords.width / 2 + selectedBlipCoords.width / 2
          )}px`
        )
        .style("top", `${parseInt(selectedBlipCoords.top + window.scrollY - tipElementCoords.height)}px`);
    }
  };

  const mouseOut = function () {
    d3.selectAll("g > a.blip-link").attr("opacity", 1.0);
    blipTableItem.classed("highlight", false);
    tip.hide().style("left", 0).style("top", 0);
  };

  const blipClick = function (e) {
    const isQuadrantView = d3.select("svg#radar-plot").classed("quadrant-view");
    const targetElement = e.target.classList.contains("blip-link") ? e.target : e.target.parentElement;
    if (isQuadrantView) {
      e.stopPropagation();
    }

    const blipId = d3.select(targetElement).attr("data-blip-id");
    highlightBlipInGraph(blipId);

    d3.selectAll(".blip-list__item-container.expand").classed("expand", false);

    let selectedBlipContainer = d3.select(`.blip-list__item-container[data-blip-id="${blipId}"`);
    selectedBlipContainer.classed("expand", true);

    setTimeout(
      () => {
        if (window.innerWidth >= uiConfig.tabletViewWidth) {
          stickQuadrantOnScroll();
        }

        const isGroupBlip = isNaN(parseInt(blipId));
        if (isGroupBlip) {
          selectedBlipContainer = d3.select(`.blip-list__item-container[data-group-id="${blipId}"`);
        }
        const elementToFocus = selectedBlipContainer.select("button.blip-list__item-container__name");
        elementToFocus.node()?.scrollIntoView({
          behavior: "smooth"
        });
      },
      isQuadrantView ? 0 : 1500
    );
  };

  !groupBlipTooltipText &&
    blipTableItem.on("mouseover", mouseOver).on("mouseout", mouseOut).on("focusin", mouseOver).on("focusout", mouseOut);
  blipGraphItem
    .on("mouseover", mouseOver)
    .on("mouseout", mouseOut)
    .on("focusin", mouseOver)
    .on("focusout", mouseOut)
    .on("click", blipClick);
}

export function renderQuadrantTables(quadrants, rings) {
  const radarContainer = d3.select("#radar");

  const quadrantTablesContainer = radarContainer.append("div").classed("quadrant-table__container", true);
  quadrants.forEach(function (quadrant) {
    // Skip quadrants that don't have valid properties
    if (!quadrant.quadrant || typeof quadrant.quadrant.blips !== "function") {
      return;
    }
    const scale = getScale();
    let quadrantContainer;
    if (window.innerWidth < uiConfig.tabletViewWidth && window.innerWidth >= uiConfig.mobileViewWidth) {
      quadrantContainer = quadrantTablesContainer
        .append("div")
        .classed("quadrant-table", true)
        .classed(quadrant.order, true)
        .style(
          "margin",
          `${
            graphConfig.quadrantHeight * scale +
            graphConfig.quadrantsGap * scale +
            graphConfig.quadrantsGap * 2 +
            uiConfig.legendsHeight
          }px auto 0px`
        )
        .style("left", "0")
        .style("right", 0);
    } else {
      quadrantContainer = quadrantTablesContainer
        .append("div")
        .classed("quadrant-table", true)
        .classed(quadrant.order, true);
    }

    const ringNames = Array.from(
      new Set(
        quadrant.quadrant
          .blips()
          .map(blip => blip.ring())
          .map(ring => ring.name())
      )
    );
    ringNames.forEach(function (ringName) {
      quadrantContainer
        .append("h2")
        .classed("quadrant-table__ring-name", true)
        .attr("data-ring-name", ringName)
        .text(ringName);
      quadrantContainer
        .append("ul")
        .classed("blip-list", true)
        .attr("data-ring-order", rings.filter(ring => ring.name() === ringName)[0].order());
    });
  });
}
