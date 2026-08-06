/**
 * Pose figures live apart from pose content so they can be authored
 * independently. Each record maps pose id → inner SVG markup (no <svg>
 * tag), viewBox 0 0 100 100, stroke="currentColor", fill="none".
 */
import { standingFigures } from './standing';
import { floorFigures } from './floor';

export const figures: Record<string, string> = {
  ...standingFigures,
  ...floorFigures,
};
