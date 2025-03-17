"use client";

import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import dynamic from "next/dynamic";
import { getRadarData } from "@/app/actions/radar";
import Factory from "@/lib/legacy/util/factory";

export function Radar({ user, radar }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (isInitialized) return;

      try {
        const { entries, quadrants, rings } = await getRadarData(user, radar);

        if (mounted) {
          const factory = new Factory();
          // Filter out quadrants that don't have a name
          const filteredQuadrants = quadrants ? quadrants.filter(q => q && q.trim() !== '') : [];
          
          // Ensure we have valid data before building
          if (entries && entries.length >= 0 && filteredQuadrants && filteredQuadrants.length > 0 && rings && rings.length >= 3) {
            factory.build(entries, {
              rings,
              quadrants: filteredQuadrants,
              print_layout: false
            }, user, radar);
            setIsInitialized(true);
          } else {
            console.error("Invalid data format for radar", { entries, quadrants: filteredQuadrants, rings });
          }
        }
      } catch (error) {
        console.error("Error initializing radar:", error);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [user, radar, isInitialized]);

  return (
    <>
      <div className="graph-header"></div>
      <div id="radar"></div>
    </>
  );
}

Radar.propTypes = {
  user: PropTypes.string.isRequired,
  radar: PropTypes.string.isRequired
};

export default dynamic(() => Promise.resolve(Radar), {
  ssr: false
});
