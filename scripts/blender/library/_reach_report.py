"""Compare unchanged library authoring on both skeletons; no sheet files are written.

python scripts/blender/library/_reach_report.py
Checks are suppressed in this measurement only: opt-in alone is not a migration.
"""
import contextlib
import io
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
IDS = ('padangusthasana', 'padahastasana', 'uttanasana', 'janu_sirsasana',
       'trianga_mukhaikapada_paschimottanasana', 'paschimottanasana', 'upavistha_konasana',
       'marichyasana_i', 'ardha_baddha_padma_paschimottanasana', 'baddha_padmasana',
       'yoga_mudrasana', 'supta_padangusthasana', 'supta_konasana', 'bharadvajasana',
       'marichyasana_ii', 'ardha_matsyendrasana')


def measure(pid, variant):
    path = HERE / f'{pid}.py'
    source = path.read_text(encoding='utf-8')
    source = re.sub(r"L.begin\([^\n]+\)", f"L.begin('{pid}', skeleton={variant!r})\nL.check = lambda p: p", source)
    source = source.replace('T.check(', 'L.check(')
    ns = {'__file__': str(path), '__name__': '_reach_measurement'}
    with contextlib.redirect_stderr(io.StringIO()):
        exec(compile(source, str(path), 'exec'), ns)
    L = ns['L']
    held = max(ns['POSTURE']['stages'], key=lambda st: st['hold'])['pose']
    at = L.fk(held)
    if pid in ('padangusthasana', 'padahastasana', 'uttanasana'):
        target = ns[{'padangusthasana': 'toe_wrist', 'padahastasana': 'under_wrist', 'uttanasana': 'floor_wrist'}[pid]]
        return {label: ns['S'].shortfall(ns[key], 'L', target(L.fk(ns[key]), 'L')) * 100
                for label, key in [('concave', 'CONCAVE'), ('fold', 'FOLDED')]}
    if pid == 'paschimottanasana':
        # The pre-migration target and trunk: measure lengths alone, not the new clasp.
        F = ns['F']
        pose = ns['legs'](F.sit())
        F.trunk(pose, 35, 60, 105, 105, 110)
        F.clavicles(pose, fwd=0.55, down=0.2)
        return {'original wrist target': F.shortfall(pose, 'L', F.beyond_soles(pose), 'report') * 100}
    if pid in ('janu_sirsasana', 'trianga_mukhaikapada_paschimottanasana', 'upavistha_konasana', 'marichyasana_i'):
        return {k: v * 100 for k, v in ns['F'].SHORT.items() if 'the book:' in k}
    if pid in ('marichyasana_ii', 'ardha_matsyendrasana'):
        return {'wrist to wrist': L.dist(at['wrist.L'], at['wrist.R']) * 100}
    if pid == 'bharadvajasana':
        return {'fingertip to opposite elbow': L.dist(at['fingers.L'], at['elbow.R']) * 100}
    poses = [(st['label'], L.fk(st['pose'])) for st in ns['POSTURE']['stages']]
    if pid == 'ardha_baddha_padma_paschimottanasana':
        return {f'{label}, {s} fingertip to toe': L.dist(a[f'fingers.{s}'], a[f'toes.{s}']) * 100
                for label, a in poses if label in ('Catch and look up', 'Fold') for s in 'LR'}
    if pid == 'supta_padangusthasana':
        return {f'{label}, fingertip to toe': L.dist(a['fingers.L'], a['toes.L']) * 100
                for label, a in poses if label in ('Take the leg', 'Chin to knee')}
    return {f'{s} fingertip to toe': L.dist(at[f'fingers.{s}'], at[f'toes.{s}']) * 100 for s in 'LR'}


def main():
    result = {pid.replace('_', '-'): {name: measure(pid, variant) for name, variant in [('base', None), ('library', 'library')]} for pid in IDS}
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
