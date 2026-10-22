import type { ImageKey } from "./types";

/**
 * The app is served from a sub-path (see next.config.ts). next/link and the router add it
 * automatically, but raw asset URLs do not, so every file in /public goes through here.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string): string => `${BASE_PATH}${path}`;

export const productImage = (key: ImageKey): string => asset(`/images/${key}.webp`);
