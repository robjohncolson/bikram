import { Component } from 'react';
import type { ReactNode } from 'react';

/**
 * Catches a live-figure failure that React throws instead of reporting:
 * `React.lazy` has no rejection path, so a FigureRig chunk that fails to
 * load (offline, a stale deploy's hashes) would otherwise throw out of the
 * whole tree — the app has no other error boundary. The boundary renders
 * nothing and calls `onFail`, the same "rig unavailable" path FigureRig
 * uses for no WebGL, a lost context or a failed three.js chunk; the sprite
 * never left the stack, so nothing flashes.
 */
export class RigBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(): void {
    this.props.onFail();
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}
