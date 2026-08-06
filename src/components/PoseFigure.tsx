import type { Pose } from '../data';

/**
 * Minimal line-art rendering of a posture. Pose figures are inner-SVG
 * strings drawn in a 0 0 100 100 viewBox with stroke="currentColor";
 * poses without a figure fall back to a numbered badge.
 */
export function PoseFigure({ pose, size = 96 }: { pose: Pose; size?: number }) {
  if (!pose.figure) {
    return (
      <div
        className="pose-figure pose-figure--badge"
        style={{ width: size, height: size, fontSize: size * 0.34 }}
        aria-hidden
      >
        {pose.order}
      </div>
    );
  }
  return (
    <svg
      className="pose-figure"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: pose.figure }}
    />
  );
}
