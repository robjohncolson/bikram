import os, re, sys
d = 'src/data/classical'
files = sorted(f for f in os.listdir(d) if re.match(r'^\d{2}-[a-z-]+\.ts$', f))
entries = []
for f in files:
    src = open(os.path.join(d, f)).read()
    m = re.search(r'export const (\w+): ClassicalNote', src)
    if not m:
        print('NO EXPORT in', f, file=sys.stderr); continue
    pose_id = f[3:-3]
    entries.append((f[:-3], m.group(1), pose_id))
lines = ['/**',
 ' * The classical (Light on Yoga) layer — one file per posture, keyed by',
 ' * pose id and merged onto `Pose.classical` by poses/index.ts. Authored',
 ' * independently of the 26 & 2 teaching on purpose; see ClassicalNote in',
 ' * ../types.ts for the contract and the originality rule.',
 ' *',
 ' * GENERATED import list — regenerate with scripts/gen-classical-index.py',
 ' * (or edit by hand: one import + one key per file).',
 ' */',
 "import type { ClassicalNote } from '../types';", '']
for base, name, pid in entries:
    lines.append(f"import {{ {name} }} from './{base}';")
lines += ['', 'export const classicalByPose: Record<string, ClassicalNote> = {']
for base, name, pid in entries:
    key = f"'{pid}'" if '-' in pid else pid
    lines.append(f"  {key}: {name},")
lines += ['};', '']
open(os.path.join(d, 'index.ts'), 'w').write('\n'.join(lines))
print(f'index: {len(entries)} entries')
