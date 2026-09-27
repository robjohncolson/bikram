"""
Render every held stage of one posture as a still and compose them into a
single dark-background contact sheet for a quick visual check. Much faster
than a full sprite render when tuning a posture's bone directions.

    blender -b --python scripts/blender/preview_stages.py -- <pose-id> [out.png]

Needs ffmpeg on PATH for the compositing step; falls back to leaving the
individual frames in `.motion-tmp/preview-<id>/`.
"""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

import bpy

sys.path.insert(0, str(Path(__file__).resolve().parent))
import render_motion as rm  # noqa: E402


def main() -> None:
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    if not argv:
        print('usage: -- <pose-id> [out.png]')
        sys.exit(1)
    pose_id = argv[0]
    out = Path(argv[1]) if len(argv) > 1 else rm.ROOT / '.motion-tmp' / f'preview-{pose_id}.png'
    module = rm.POSTURES_DIR / f"{pose_id.replace('-', '_')}.py"
    posture = rm.load_posture(module)

    rm.reset_scene()
    scene = bpy.context.scene
    rm.configure_render(scene)
    rig = rm.build_armature()
    rm.build_body(rig)
    frame_box = posture.get('frame', {})
    center_z = frame_box.get('center_z', 0.9)
    cam = rm.build_camera(posture.get('view', 'front'), center_z, frame_box.get('scale', 2.0))
    rest = rm.rest_directions()

    tmp = rm.ROOT / '.motion-tmp' / f'preview-{pose_id}'
    tmp.mkdir(parents=True, exist_ok=True)
    frames = []
    for i, st in enumerate(posture['stages']):
        rm.apply_stage(rig, st['pose'], rest)
        rm.orbit_camera(cam, st.get('view', posture.get('view', 'front')), center_z)
        p = tmp / f'{i:02d}.png'
        scene.render.filepath = str(p)
        bpy.ops.render.render(write_still=True)
        frames.append((st['label'], p))
        print(f'   stage {i} {st["label"]!r} → {p.name}')

    if not shutil.which('ffmpeg'):
        print('ffmpeg not found; frames left in', tmp)
        return
    inputs = ['-f', 'lavfi', '-i', f'color=c=#1b1f2a:s={rm.FRAME_PX}x{rm.FRAME_PX}']
    chain = []
    for i, (label, p) in enumerate(frames):
        inputs += ['-i', str(p)]
        chain.append(
            f"[0][{i + 1}]overlay,drawtext=text='{i} {label}':x=6:y=6:fontsize=14:fontcolor=white[f{i}]"
        )
    stack = ''.join(f'[f{i}]' for i in range(len(frames))) + f'hstack={len(frames)}'
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', *inputs, '-filter_complex', ';'.join(chain) + ';' + stack,
           '-frames:v', '1', '-update', '1', str(out)]
    subprocess.run(cmd, check=True)
    print('preview →', out)


if __name__ == '__main__':
    main()
