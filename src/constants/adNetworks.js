// Ad networks and their placements on the public website. Ids must match the
// backend's AD_PLACEMENTS and the web-app's AD_UNITS (src/constants/ads.js),
// which holds the actual ad code.
export const AD_NETWORKS = [
  {
    id: "adsterra",
    name: "Adsterra",
    description: "Display banners on immpression.art.",
    placements: [
      {
        id: "marketplaceRailTop",
        name: "Marketplace — right column, top",
        description: "300 × 250 banner above \"From Immpression\" on /marketplace. On phones: after the first 2 rows of art.",
      },
    ],
  },
  {
    id: "hilltop",
    name: "HilltopAds",
    description: "Display banners on immpression.art.",
    placements: [
      {
        id: "marketplaceRailSecond",
        name: "Marketplace — right column, middle",
        description: "300 × 250 banner below \"From Immpression\" on /marketplace. On phones: after the first 4 rows of art.",
      },
    ],
  },
];

// Counts live placements (network on + placement on) for dashboard summaries.
export function countLivePlacements(ads) {
  let live = 0;
  let total = 0;
  for (const network of AD_NETWORKS) {
    for (const placement of network.placements) {
      total += 1;
      if (ads?.[network.id]?.enabled && ads?.[network.id]?.placements?.[placement.id]?.enabled) live += 1;
    }
  }
  return { live, total };
}
