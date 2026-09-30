"""
The twist family's helpers (a `_` file: never exported or previewed as a
sheet). Group E built the rolled trunk here; since the integration it lives
in `_lib.py` as the SHARED way to roll non-leaf bones (`roll`, `twist`,
`shoulders`, `turn_about`, the roll-aware `fk`, the trunk-across rule in
`check`, `hull_low`, `mirror`, `reach_short`). This file only hands them on,
so the twist sheets keep their imports:

    _spec = importlib.util.spec_from_file_location('_library_twist', Path(__file__).resolve().parent / '_twist.py')
    T = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(T)
    L = T.L
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lib', Path(__file__).resolve().parent / '_lib.py')
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)
H = L.H

roll, twist, shoulders, turn_about = L.roll, L.twist, L.shoulders, L.turn_about
fk, plain, check, hull_low = L.fk, L.plain, L.check, L.hull_low
mirror, reach_short, across_check = L.mirror, L.reach_short, L.across_check


def open_hands(pose):
    """Hands clear of the thighs while changing which knee folds."""
    for side, sx in (('L', 1), ('R', -1)):
        hip = L.fk(pose)[f'hip.{side}']
        L.arm(pose, side, (hip[0] + sx * 0.28, hip[1] - 0.12, 0.42),
              (sx, 0, -1), (0, -1, 0))
    return pose
