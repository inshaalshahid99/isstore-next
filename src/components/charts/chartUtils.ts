/** SVG ids must be valid in url(#id); React's useId output contains characters that are not. */
export const svgId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "");

/** Short money for axis ticks: $12k, $4.5k, $800. */
export const axisMoney = (v: number) => (v >= 1000 ? `$${+(v / 1000).toFixed(1)}k` : `$${v}`);

export const TICK = { fill: "var(--tx2)", fontSize: 12 };
