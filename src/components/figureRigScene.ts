/**
 * The three.js side of the live figure (loaded lazily by `FigureRig`, so
 * three never lands in the main bundle). It draws LINE ART like the
 * Freestyle sheets: the mannequin (elliptical tubes + joint ellipsoids from
 * `rig/body.ts bodyRecipe`) is rendered as view-space normals + depth into a render
 * target, then a full-screen edge pass marks the depth and normal
 * discontinuities — the silhouette, and the contour where an arm crosses
 * the torso — as stroke coverage in alpha. One WebGL context renders each
 * layer (ghost, figure, guides) and copies it onto that layer's own 2D
 * canvas, so CSS can fade a teaching layer in and out (class mode's
 * `data-on`) without a render loop.
 */
import {
  Camera,
  CustomBlending,
  BufferGeometry,
  DepthTexture,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshNormalMaterial,
  OneFactor,
  OneMinusSrcAlphaFactor,
  OrthographicCamera,
  PlaneGeometry,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector4,
  WebGLRenderTarget,
  WebGLRenderer,
} from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import type { CameraState, JointRecipe, RigPose, Solved, TubeRecipe, Vec3 } from '../rig';
import { bodyRecipe, hingeBone, jointRadii, placeBone, placeJoint, solve } from '../rig';

/**
 * The sheets' stroke as it reaches the screen, in px of ink across at the
 * 240 px cell: Freestyle's 1.7 px line (render_motion.py LINE_PX) with its
 * round caps and antialiasing measures ~3.05 px across once encoded
 * (profiled on the posture page against the sprite cell of the same stage).
 */
const INK_PX = 3.05;
/** the edge pass's antialiased rim adds about this much ink (px) to 2 × halfWidth */
const EDGE_AA = 0.5;
const GUIDE_PX = 1.0;
const FRAME_PX = 240;
/**
 * a depth jump larger than this (metres) between neighbouring pixels is a
 * contour — measured against the depth the surface's own slope predicts
 * there, so a surface seen nearly edge-on (a heel tucked under the seat)
 * is not mistaken for a fill of contours
 */
const DEPTH_JUMP = 0.05;
/** the slope prediction stops at this steepness (the view normal's z) */
const MIN_FACING = 0.08;
/** neighbouring normals closer than this (cosine) are the same surface */
const NORMAL_SAME = 0.5;
/**
 * A normal crease is only a stroke where it is a CONTOUR, as Freestyle
 * draws them: the nearer side is turning away from the camera (its view
 * normal within this of edge-on) over a surface just behind it — an arm
 * lying against the torso. Where two surfaces meet in a concave fold (an
 * arm pressed to the head, the tube running into a joint) neither side is
 * edge-on and the sheets draw nothing, so neither does the rig.
 */
const GRAZING = 0.7;
/** the surface behind a contour must be at least this far back (metres) */
const CONTOUR_GAP = 0.002;
const NEAR = 0.1;
const FAR = 20;

export type RGBA = [number, number, number, number];

export interface RigLayers {
  /** the figure's pose */
  figure: RigPose;
  /** the ghost's pose, when it shows */
  ghost?: RigPose;
  /** guide line segments, when they show */
  guides?: [Vec3, Vec3][];
}

export interface RigColors {
  figure: RGBA;
  ghost: RGBA;
  guides: RGBA;
}

export interface RigTargets {
  figure: HTMLCanvasElement;
  ghost: HTMLCanvasElement;
  guides: HTMLCanvasElement;
}

const EDGE_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/**
 * Stroke coverage from the normal/depth target: for each pixel, the
 * nearest neighbour (on rings half a pixel apart, eight directions) across
 * a discontinuity sets how far the pixel is from the contour, and the
 * coverage falls off over the stroke's half width — round-ish, antialiased
 * lines centred on the contour, like Freestyle's.
 */
const EDGE_FRAG = /* glsl */ `
uniform sampler2D tNormal;
uniform sampler2D tDepth;
uniform vec2 texel;
uniform float halfWidth;
uniform float depthRange;
uniform float metersPerPx;
uniform vec4 color;
varying vec2 vUv;

const int RINGS = 12;
const float DEPTH_JUMP = ${DEPTH_JUMP.toFixed(4)};
const float MIN_FACING = ${MIN_FACING.toFixed(3)};
const float NORMAL_SAME = ${NORMAL_SAME.toFixed(3)};
const float GRAZING = ${GRAZING.toFixed(3)};
const float CONTOUR_GAP = ${CONTOUR_GAP.toFixed(4)};

bool edgeBetween(float dc, vec3 nc, vec2 uv, vec2 offPx) {
  float ds = texture2D(tDepth, uv).x;
  bool bc = dc >= 0.99999;
  bool bs = ds >= 0.99999;
  if (bc && bs) return false;
  if (bc != bs) return true;
  float dz = (ds - dc) * depthRange;
  // what the centre's own surface would do over this offset (a plane with
  // view normal nc: depth grows by n.xy · offset / n.z)
  float pred = dot(nc.xy, offPx * metersPerPx) / max(nc.z, MIN_FACING);
  if (abs(dz - pred) > DEPTH_JUMP) return true;
  vec3 ns = texture2D(tNormal, uv).xyz * 2.0 - 1.0;
  if (dot(nc, ns) >= NORMAL_SAME || abs(dz) < CONTOUR_GAP) return false;
  vec3 nNear = dz > 0.0 ? nc : ns;
  return abs(nNear.z) < GRAZING;
}

void main() {
  float dc = texture2D(tDepth, vUv).x;
  vec3 nc = texture2D(tNormal, vUv).xyz * 2.0 - 1.0;
  float dmin = 1e3;
  for (int k = 1; k <= RINGS; k++) {
    float d = float(k) * 0.5;
    if (d > halfWidth + 1.0) break;
    for (int i = 0; i < 8; i++) {
      float a = float(i) * 0.78539816;
      vec2 off = vec2(cos(a), sin(a)) * d;
      if (edgeBetween(dc, nc, vUv + off * texel, off)) { dmin = d; break; }
    }
    if (dmin < 1e3) break;
  }
  float cover = clamp(halfWidth + 1.0 - dmin, 0.0, 1.0);
  gl_FragColor = vec4(color.rgb * color.a, color.a) * cover;
}
`;

/** An open elliptical frustum along a rest-space tube edge (smooth normals all round). */
function tubeGeometry(t: TubeRecipe): BufferGeometry {
  const pos: number[] = [];
  const index: number[] = [];
  for (let end = 0; end < 2; end++) {
    const c = end === 0 ? t.from : t.to;
    const ru = t.ru[end];
    const rv = t.rv[end];
    for (let i = 0; i < TUBE_SIDES; i++) {
      const a = (i / TUBE_SIDES) * Math.PI * 2;
      const cu = Math.cos(a) * ru;
      const sv = Math.sin(a) * rv;
      pos.push(c[0] + t.u[0] * cu + t.v[0] * sv, c[1] + t.u[1] * cu + t.v[1] * sv, c[2] + t.u[2] * cu + t.v[2] * sv);
    }
  }
  for (let i = 0; i < TUBE_SIDES; i++) {
    const j = (i + 1) % TUBE_SIDES;
    index.push(i, j, TUBE_SIDES + i, j, TUBE_SIDES + j, TUBE_SIDES + i);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

const TUBE_SIDES = 24;

/**
 * A mannequin: per bone one group holding that bone's tubes and joint
 * ellipsoids in REST coordinates (`rig/body.ts bodyRecipe`), so posing is
 * one rigid transform per bone (`placeBone`) — no geometry is rebuilt. A
 * hinge joint's ellipsoid has a group of its own, turned halfway between
 * its two bones (`placeJoint`) and sized to hold both rims (`jointRadii`).
 */
class Mannequin {
  readonly group = new Group();
  private bones = new Map<string, Group>();
  private hinges: { joint: JointRecipe; group: Group; mesh: Mesh }[] = [];
  private geometries: BufferGeometry[] = [];

  constructor(material: MeshNormalMaterial) {
    const { tubes, joints } = bodyRecipe();
    const groupOf = (bone: string) => {
      let g = this.bones.get(bone);
      if (!g) {
        g = new Group();
        this.bones.set(bone, g);
        this.group.add(g);
      }
      return g;
    };
    for (const t of tubes) {
      const geo = tubeGeometry(t);
      this.geometries.push(geo);
      groupOf(t.bone).add(new Mesh(geo, material));
    }
    const ball = new SphereGeometry(1, 24, 16);
    this.geometries.push(ball);
    for (const j of joints) {
      const m = new Mesh(ball, material);
      m.position.set(...j.at);
      m.scale.set(...j.radii);
      if (hingeBone(j.vertex)) {
        const g = new Group();
        g.add(m);
        this.group.add(g);
        this.hinges.push({ joint: j, group: g, mesh: m });
      } else {
        groupOf(j.bone).add(m);
      }
    }
  }

  pose(solved: Solved) {
    for (const [bone, g] of this.bones) {
      const { position, q } = placeBone(solved, bone);
      g.position.set(...position);
      g.quaternion.set(q[1], q[2], q[3], q[0]);
    }
    for (const { joint, group, mesh } of this.hinges) {
      const { position, q } = placeJoint(solved, joint);
      group.position.set(...position);
      group.quaternion.set(q[1], q[2], q[3], q[0]);
      // grown just enough to hold both tube rims when they roll against it (== the fit at rest)
      mesh.scale.set(...jointRadii(solved, joint));
    }
  }

  dispose() {
    for (const g of this.geometries) g.dispose();
  }
}

/** Two layer keys match when every part is identical (by reference or value). */
function sameKey(a: unknown[] | undefined, b: unknown[] | undefined): boolean {
  if (!a || !b) return a === b;
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

export class RigScene {
  private renderer: WebGLRenderer;
  private camera = new OrthographicCamera(-1, 1, 1, -1, NEAR, FAR);
  private normalMaterial = new MeshNormalMaterial();
  private figure: Mannequin;
  private ghost: Mannequin;
  private bodyScene = new Scene();
  private edgeScene = new Scene();
  private edgeCamera = new Camera();
  private edge: ShaderMaterial;
  /** the full-screen quad the edge pass draws on */
  private edgeQuad: Mesh;
  private target: WebGLRenderTarget;
  private guideScene = new Scene();
  private guideLines: LineSegments2;
  private guideMaterial: LineMaterial;
  private size = 0;
  private dpr = 1;
  /** ms the last render took (every layer drawn, copies included) */
  lastRenderMs = 0;
  /** what each teaching layer's canvas holds now (see `render`) */
  private drawn: { ghost?: unknown[]; guides?: unknown[] } = {};

  constructor() {
    const canvas = document.createElement('canvas');
    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.autoClear = false;
    this.camera.up.set(0, 0, 1);
    this.figure = new Mannequin(this.normalMaterial);
    this.ghost = new Mannequin(this.normalMaterial);
    this.target = new WebGLRenderTarget(1, 1, { depthTexture: new DepthTexture(1, 1) });
    this.edge = new ShaderMaterial({
      vertexShader: EDGE_VERT,
      fragmentShader: EDGE_FRAG,
      uniforms: {
        tNormal: { value: this.target.texture },
        tDepth: { value: this.target.depthTexture },
        texel: { value: new Vector2(1, 1) },
        halfWidth: { value: 1 },
        depthRange: { value: FAR - NEAR },
        metersPerPx: { value: 0.01 },
        color: { value: new Vector4(1, 1, 1, 1) },
      },
      depthTest: false,
      depthWrite: false,
      transparent: true,
      blending: CustomBlending,
      blendSrc: OneFactor,
      blendDst: OneMinusSrcAlphaFactor,
    });
    this.edgeQuad = new Mesh(new PlaneGeometry(2, 2), this.edge);
    this.edgeScene.add(this.edgeQuad);
    this.guideMaterial = new LineMaterial({ linewidth: 1, transparent: true, depthTest: false, depthWrite: false });
    this.guideLines = new LineSegments2(new LineSegmentsGeometry(), this.guideMaterial);
    this.guideLines.frustumCulled = false;
    this.guideScene.add(this.guideLines);
  }

  get canvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  /**
   * Size in CSS px (square); the backing store is capped at 2× DPR. No
   * supersampling: drawing the edge target at 2× and scaling it down took
   * a class-mode blend frame past the 8 ms budget at 4× CPU throttling
   * (median ~8.8 ms batched, ~16 ms with the readback, against ~6 / ~11 ms),
   * so a 1× screen gets the edge pass's own antialiased strokes.
   */
  setSize(size: number) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (size === this.size && dpr === this.dpr) return;
    this.size = size;
    this.dpr = dpr;
    const px = Math.max(1, Math.round(size * dpr));
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(px, px, false);
    this.target.setSize(px, px);
    (this.edge.uniforms.texel.value as Vector2).set(1 / px, 1 / px);
    // the sheets' stroke, scaled with the cell (and the backing store)
    this.edge.uniforms.halfWidth.value = Math.max(0.5, ((INK_PX / FRAME_PX) * px - EDGE_AA) / 2);
    this.guideMaterial.resolution.set(px, px);
    this.guideMaterial.linewidth = Math.max(1, (GUIDE_PX / FRAME_PX) * px);
  }

  private aim(cam: CameraState) {
    const h = cam.scale / 2;
    this.edge.uniforms.metersPerPx.value = cam.scale / Math.max(1, this.renderer.domElement.width);
    this.camera.left = -h;
    this.camera.right = h;
    this.camera.top = h;
    this.camera.bottom = -h;
    // the camera hangs on the pivot's -Y at 10 m and orbits it about +Z
    // (render_motion.py build_camera / orbit_camera)
    const s = Math.sin(cam.azimuth);
    const c = Math.cos(cam.azimuth);
    this.camera.position.set(10 * s, -10 * c, cam.centerZ);
    this.camera.lookAt(0, 0, cam.centerZ);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
  }

  /** One mannequin through the edge pass onto the (cleared) drawing buffer. */
  private strokes(m: Mannequin, color: RGBA) {
    const r = this.renderer;
    this.bodyScene.clear();
    this.bodyScene.add(m.group);
    r.setRenderTarget(this.target);
    r.setClearColor(0x808080, 1);
    r.clear(true, true, false);
    r.render(this.bodyScene, this.camera);
    r.setRenderTarget(null);
    r.setClearColor(0x000000, 0);
    (this.edge.uniforms.color.value as Vector4).set(...color);
    r.render(this.edgeScene, this.edgeCamera);
  }

  private copyTo(out: HTMLCanvasElement, draw: boolean) {
    const px = this.renderer.domElement.width;
    if (out.width !== px || out.height !== px) {
      out.width = px;
      out.height = px;
    }
    const ctx = out.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, px, px);
    if (draw) ctx.drawImage(this.renderer.domElement, 0, 0);
  }

  /**
   * Draw every layer for this frame. The WebGL canvas is copied into each
   * layer's own 2D canvas straight after it is drawn (same task, so no
   * preserved drawing buffer is needed).
   */
  render(layers: RigLayers, cam: CameraState, colors: RigColors, out: RigTargets) {
    const t0 = performance.now();
    const r = this.renderer;
    this.aim(cam);
    const view = `${cam.azimuth},${cam.centerZ},${cam.scale},${this.size},${this.dpr}`;

    // the teaching layers are static through a hold (the breath moves only
    // the figure): each is redrawn only when its content, the camera, the
    // size or its colour changes — an empty layer is cleared once
    const ghostKey = layers.ghost ? [layers.ghost, view, colors.ghost.join()] : undefined;
    if (!sameKey(ghostKey, this.drawn.ghost)) {
      if (layers.ghost) {
        r.clear(true, true, true);
        this.ghost.pose(solve(layers.ghost));
        this.strokes(this.ghost, colors.ghost);
      }
      this.copyTo(out.ghost, Boolean(layers.ghost));
      this.drawn.ghost = ghostKey;
    }

    r.clear(true, true, true);
    this.figure.pose(solve(layers.figure));
    this.strokes(this.figure, colors.figure);
    this.copyTo(out.figure, true);

    const segs = layers.guides ?? [];
    const guideKey = segs.length ? [segs, view, colors.guides.join()] : undefined;
    if (!sameKey(guideKey, this.drawn.guides)) {
      if (segs.length) {
        r.clear(true, true, true);
        const flat: number[] = [];
        for (const [a, b] of segs) flat.push(...a, ...b);
        const geo = new LineSegmentsGeometry();
        geo.setPositions(flat);
        this.guideLines.geometry.dispose();
        this.guideLines.geometry = geo;
        // CSS colours are sRGB; the line shader converts back on output
        this.guideMaterial.color.setRGB(colors.guides[0], colors.guides[1], colors.guides[2], SRGBColorSpace);
        this.guideMaterial.opacity = colors.guides[3];
        r.render(this.guideScene, this.camera);
      }
      this.copyTo(out.guides, segs.length > 0);
      this.drawn.guides = guideKey;
    }
    // measurement only: a 1-pixel read waits for the GPU, so the time
    // includes the edge passes themselves, not just their submission
    if ((globalThis as { __rigSyncTiming?: boolean }).__rigSyncTiming) {
      const gl = r.getContext();
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    }
    this.lastRenderMs = performance.now() - t0;
  }

  /** Stop drawing: the context and every buffer go (a lost context reports through here too). */
  onContextLost(cb: () => void) {
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      cb();
    });
  }

  dispose() {
    this.figure.dispose();
    this.ghost.dispose();
    this.guideLines.geometry.dispose();
    this.guideMaterial.dispose();
    this.edge.dispose();
    this.edgeQuad.geometry.dispose();
    this.normalMaterial.dispose();
    this.target.depthTexture?.dispose();
    this.target.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
