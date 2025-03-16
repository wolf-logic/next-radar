import * as d3 from "d3";
import { selectRadarQuadrant, removeScrollListener } from "./quadrants";
import { getRingIdString } from "@/lib/legacy/util/stringUtil";

// Keep track of whether we're handling a popstate event
export let isHandlingPopState = false;

function waitForElement(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

export function updateURL(quadrantName, replace = false) {
    if (isHandlingPopState) return;

    const cleanName = getRingIdString(quadrantName);
    const newUrl = cleanName === "all-quadrants"
        ? window.location.pathname
        : `${ window.location.pathname }?quadrant=${ cleanName }`;

    if (replace) {
        window.history.replaceState(
            { quadrant: cleanName },
            "",
            newUrl
        );
    } else {
        window.history.pushState(
            { quadrant: cleanName },
            "",
            newUrl
        );
    }
}

async function handlePopState(event) {
    isHandlingPopState = true;
    try {
        const quadrantName = event.state?.quadrant || "all-quadrants";
        // Wait for the element to be available
        await waitForElement(`#subnav-item-${ quadrantName }`);

        const listItem = d3.select(`#subnav-item-${ quadrantName }`);
        if (listItem.node()) {
            listItem.select("button").node().click();
        }
    } finally {
        isHandlingPopState = false;
    }
}

function addListItem(quadrantList, name, callback) {
    const listItem = quadrantList
        .append("li")
        .attr("id", `subnav-item-${ getRingIdString(name) }`)
        .classed("quadrant-subnav__list-item", true);

    listItem
        .append("button")
        .classed("quadrant-subnav__list-item__button", true)
        .attr("role", "tab")
        .text(name)
        .on("click", function (e) {
            if (!document.querySelector(".graph-header")) {
                console.warn("Graph header not found");
                return;
            }

            removeScrollListener();

            // Update active state for all items
            d3.selectAll(".quadrant-subnav__list-item")
                .classed("active-item", false)
                .select("button")
                .attr("aria-selected", "false");

            // Set active state for clicked item
            d3.select(this.parentNode)
                .classed("active-item", true)
                .select("button")
                .attr("aria-selected", "true");

            const header = d3.select(".graph-header").node();
            if (header) {
                header.scrollIntoView({
                    behavior: "smooth",
                });
            }

            // Safely update dropdown text
            const dropdownSelector = d3.select("span.quadrant-subnav__dropdown-selector");
            if (dropdownSelector.node()) {
                dropdownSelector.text(e.target.innerText);
            }

            const subnavArrow = d3.select(".quadrant-subnav__dropdown-arrow");
            if (subnavArrow.node()) {
                subnavArrow.classed("rotate", !subnavArrow.classed("rotate"));
            }

            if (quadrantList.node()) {
                quadrantList.classed("show", !quadrantList.classed("show"));
            }

            const subnavDropdown = d3.select(".quadrant-subnav__dropdown");
            if (subnavDropdown.node()) {
                subnavDropdown.attr("aria-expanded",
                    subnavDropdown.attr("aria-expanded") === "false" ? "true" : "false"
                );
            }

            d3.selectAll(".blip-list__item-container.expand").classed("expand", false);

            // Update URL in browser history
            if (!isHandlingPopState) {
                updateURL(name);
            }

            if (callback) {
                callback();
            }
        });

    return listItem;
}

export function renderQuadrantSubnav(radarHeader, quadrants, renderFullRadar) {
    // Remove any existing event listeners
    window.removeEventListener("popstate", handlePopState);

    // Add popstate event listener for handling browser back/forward
    window.addEventListener("popstate", handlePopState);

    const subnavContainer = radarHeader.append("nav").classed("quadrant-subnav", true);

    const subnavDropdown = subnavContainer
        .append("div")
        .classed("quadrant-subnav__dropdown", true)
        .attr("aria-expanded", "false");
    subnavDropdown.append("span").classed("quadrant-subnav__dropdown-selector", true).text("All quadrants");
    const subnavArrow = subnavDropdown.append("span").classed("quadrant-subnav__dropdown-arrow", true);

    const quadrantList = subnavContainer.append("ul").classed("quadrant-subnav__list", true);

    // Add "All quadrants" option
    const allQuadrants = addListItem(quadrantList, "All quadrants", renderFullRadar);
    allQuadrants.classed("active-item", true).select("button").attr("aria-selected", "true");

    subnavDropdown.on("click", function () {
        if (subnavArrow.node()) {
            subnavArrow.classed("rotate", !subnavArrow.classed("rotate"));
        }
        if (quadrantList.node()) {
            quadrantList.classed("show", !quadrantList.classed("show"));
        }
        subnavDropdown.attr("aria-expanded",
            subnavDropdown.attr("aria-expanded") === "false" ? "true" : "false"
        );
    });

    // Add quadrant options
    quadrants.forEach(function (quadrant) {
        // Skip undefined quadrants or those without names
        if (quadrant.quadrant && typeof quadrant.quadrant.name === 'function') {
            addListItem(quadrantList, quadrant.quadrant.name(), () =>
                selectRadarQuadrant(quadrant.order, quadrant.startAngle, quadrant.quadrant.name()),
            );
        }
    });

    // Check URL parameters on initial load
    setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const quadrantParam = urlParams.get("quadrant");
        if (quadrantParam) {
            const listItem = d3.select(`#subnav-item-${ quadrantParam }`);
            if (listItem.node()) {
                listItem.select("button").node().click();
                // Replace the current history entry instead of adding a new one
                updateURL(quadrantParam, true);
            }
        } else {
            // Ensure we have a state for the initial "All quadrants" view
            updateURL("All quadrants", true);
        }
    }, 0);

    // Cleanup function
    return () => {
        window.removeEventListener("popstate", handlePopState);
    };
}
