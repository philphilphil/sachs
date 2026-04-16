const GAP_DEGREES = 1.5;
const GAP_RAD = (GAP_DEGREES * Math.PI) / 180;
const SLICE_RAD = (2 * Math.PI) / 12;

const DISTANCE_COLORS = [
  '#e8654a', // 0 - selected (accent)
  '#ef8c6e', // 1 - warm coral
  '#d4a574', // 2 - amber
  '#9ab086', // 3 - sage
  '#7baaa2', // 4 - teal-gray
  '#8b9ab8', // 5 - steel blue
  '#b0b0b0'  // 6 - neutral gray (tritone)
];

const DISTANCE_COLORS_MINOR = [
  '#f4a593', // 0
  '#f5b89e', // 1
  '#e5c9a8', // 2
  '#c0d1b4', // 3
  '#a8ccc6', // 4
  '#b3bfd0', // 5
  '#c8c8c8'  // 6
];

const DEFAULT_FILL = '#f0eeeb';
const DEFAULT_FILL_MINOR = '#e8e6e2';

export function harmonicDistance(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, 12 - diff);
}

export function keyAngle(index: number): number {
  return -Math.PI / 2 + index * SLICE_RAD;
}

export function wedgePath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  index: number
): string {
  const startAngle = keyAngle(index) - SLICE_RAD / 2 + GAP_RAD / 2;
  const endAngle = keyAngle(index) + SLICE_RAD / 2 - GAP_RAD / 2;

  const outerX1 = cx + outerR * Math.cos(startAngle);
  const outerY1 = cy + outerR * Math.sin(startAngle);
  const outerX2 = cx + outerR * Math.cos(endAngle);
  const outerY2 = cy + outerR * Math.sin(endAngle);
  const innerX1 = cx + innerR * Math.cos(endAngle);
  const innerY1 = cy + innerR * Math.sin(endAngle);
  const innerX2 = cx + innerR * Math.cos(startAngle);
  const innerY2 = cy + innerR * Math.sin(startAngle);

  return [
    `M${outerX1},${outerY1}`,
    `A${outerR},${outerR} 0 0,1 ${outerX2},${outerY2}`,
    `L${innerX1},${innerY1}`,
    `A${innerR},${innerR} 0 0,0 ${innerX2},${innerY2}`,
    'Z'
  ].join(' ');
}

export function distanceColor(
  distance: number,
  isMinor: boolean = false
): string {
  const clamped = Math.max(0, Math.min(6, distance));
  return isMinor ? DISTANCE_COLORS_MINOR[clamped] : DISTANCE_COLORS[clamped];
}

export function defaultFill(isMinor: boolean = false): string {
  return isMinor ? DEFAULT_FILL_MINOR : DEFAULT_FILL;
}

export function wedgeMidpoint(
  cx: number,
  cy: number,
  radius: number,
  index: number
): { x: number; y: number } {
  const angle = keyAngle(index);
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle)
  };
}

export function arcPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  cx: number,
  cy: number
): string {
  const controlX = cx + (cx - (from.x + to.x) / 2) * 0.3;
  const controlY = cy + (cy - (from.y + to.y) / 2) * 0.3;
  return `M${from.x},${from.y} Q${controlX},${controlY} ${to.x},${to.y}`;
}

export function shortestRotationTo(
  currentDeg: number,
  targetDeg: number
): number {
  let diff = targetDeg - currentDeg;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
}
