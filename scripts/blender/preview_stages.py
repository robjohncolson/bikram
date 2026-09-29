"""
Render every held stage of one posture as a still and compose them into a
single dark-background contact sheet for a quick visual check. Much faster
than a full sprite render when tuning a posture's bone directions.

    blender -b --python scripts/blender/preview_stages.py -- <pose-id | bridge:<a>-<b>> [out.png]

Stages with `guides` show them in blue, stages with a `ghost` show the
ghost figure in orange, both under the white figure (the real sheets keep
them as separate grayscale layers).

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

TINT = {
    'guides': 'colorchannelmixer=rr=0.45:gg=0.75:bb=1.0',
    'ghost': 'colorchannelmixer=rr=1.0:gg=0.6:bb=0.3:aa=0.85',
}


def render_to(scene: bpy.types.Scene, p: Path) -> Path:
    scene.render.filepath = str(p)
    bpy.ops.render.render(write_still=True)
    return p


def main() -> None:
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    if not argv:
        print('usage: -- <pose-id> [out.png]')
        sys.exit(1)
    pose_id = argv[0]
    stem = rm.file_stem(pose_id)
    out = Path(argv[1]) if len(argv) > 1 else rm.ROOT / '.motion-tmp' / f'preview-{stem}.png'
    posture = rm.load_posture(rm.module_path(pose_id))

    built = rm.build_scene(posture)
    scene, layers, rig, cam = built['scene'], built['layers'], built['rig'], built['cam']
    guides, ghost = built['guides'], built['ghost']
    rest = rm.rest_directions()

    tmp = rm.ROOT / '.motion-tmp' / f'preview-{stem}'
    tmp.mkdir(parents=True, exist_ok=True)
    frames = []   # (label, {'figure': p, 'guides': p?, 'ghost': p?})
    for i, st in enumerate(posture['stages']):
        rm.apply_stage(rig, st['pose'], rest)
        center_z, scale = rm.stage_frame(posture, st)
        rm.orbit_camera(cam, st.get('view', posture.get('view', 'front')), center_z)
        rm.frame_camera(cam, center_z, scale)
        cells = {}
        if guides[i] is not None:
            rm.solo(layers, 'Guides')
            rm.show_guides(guides, i)
            rm.guide_strokes(scene, True)
            cells['guides'] = render_to(scene, tmp / f'{i:02d}.guides.png')
            rm.guide_strokes(scene, False)
        if st.get('ghost'):
            rm.solo(layers, 'Ghost')
            rm.apply_stage(ghost, rm.ghost_pose(st), rest)
            cells['ghost'] = render_to(scene, tmp / f'{i:02d}.ghost.png')
        rm.solo(layers, 'Figure')
        cells['figure'] = render_to(scene, tmp / f'{i:02d}.png')
        frames.append((st['label'], cells))
        print(f'   stage {i} {st["label"]!r} → {", ".join(sorted(cells))}')

    if not shutil.which('ffmpeg'):
        print('ffmpeg not found; frames left in', tmp)
        return
    inputs = ['-f', 'lavfi', '-i', f'color=c=#1b1f2a:s={rm.FRAME_PX}x{rm.FRAME_PX}']
    chain = []
    n = 1
    for i, (label, cells) in enumerate(frames):
        base = '[0]'
        for layer in ('guides', 'ghost', 'figure'):
            if layer not in cells:
                continue
            inputs += ['-i', str(cells[layer])]
            src = f'[{n}]'
            if layer in TINT:
                chain.append(f'{src}format=rgba,{TINT[layer]}[t{n}]')
                src = f'[t{n}]'
            chain.append(f'{base}{src}overlay[o{n}]')
            base = f'[o{n}]'
            n += 1
        chain.append(f"{base}drawtext=text='{i} {label}':x=6:y=6:fontsize=14:fontcolor=white[f{i}]")
    stack = ''.join(f'[f{i}]' for i in range(len(frames))) + f'hstack={len(frames)}'
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', *inputs, '-filter_complex', ';'.join(chain) + ';' + stack,
           '-frames:v', '1', '-update', '1', str(out)]
    subprocess.run(cmd, check=True)
    print('preview →', out)


if __name__ == '__main__':
    main()
