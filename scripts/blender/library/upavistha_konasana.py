"""
Upavistha konasana (the seated wide angle) — library sheet, live figure
only.

From the staff (seen from the quarter): the legs are taken wide apart,
straight, their backs on the mat (the camera comes round to the front);
the spine erect and the ribs lifted, the hands on the legs; the trunk
bends forward and the head comes down to the mat; then the chest; up
again, and the legs come back together. Shape from the book's
photographs; the stages are ours.

Reach: the book takes the big toes with the spine erect and holds the
feet with the chest on the mat. The rig's arms fall well short of the
toes while the trunk is upright (`_folds.SHORT`), so the hands rest at the
knees there; lying forward they hold the legs just above the ankles
(`forward` says why not the feet).
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_folds', Path(__file__).resolve().parent / '_folds.py')
F = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(F)
L = F.L
L.begin('upavistha-konasana')

WIDE = 1.2   # each leg ~50 degrees out from straight ahead: as wide as the rig's frame and reach allow


def wide():
    pose = F.sit()
    F.straight(pose, 'L', splay=WIDE)
    F.straight(pose, 'R', splay=WIDE)
    return pose


SIT = F.staff()

# the legs back together, the hands still on the thighs (from the knees
# straight to the mat the hands dipped under it on the way)
TOGETHER = F.sit()
F.straight(TOGETHER, 'L')
F.straight(TOGETHER, 'R')
for _s in 'LR':
    L.hand_on_thigh(TOGETHER, _s, t=0.5, nrm=L.n((F.SX[_s] * 0.6, 0, 1)), gap=0.03)

# the legs wide, the hands resting on the thighs
APART = wide()
for _s in 'LR':
    L.hand_on_thigh(APART, _s, t=0.5, gap=0.02)

# the spine erect, the chest lifted: the hands at the knees
ERECT = wide()
F.trunk(ERECT, 0, 8, 3, -5, -12)
at = L.fk(ERECT)
for s, sx in F.SIDES:
    L.hand_on_thigh(ERECT, s, t=0.92, gap=0.02)
    F.shortfall(ERECT, s, at[f'toes.{s}'], f'the book: the big toe with the spine erect, {s}')


def forward(pose, label):
    """The arms out along the legs, the hands on the lowest part of the shins
    just above the ankles (on their upper inner side), the fingers toward the
    feet. The arms do reach the feet's inner edges lying forward, but a palm
    there turns the hand hard against the forearm, and rising to the knees
    then folded the fingers back through it (the clearance check): the
    ankles are the nearest grip that clears."""
    F.clavicles(pose, fwd=0.15, down=0.1)
    at = L.fk(pose)
    for s, sx in F.SIDES:
        knee, ankle = at[f'knee.{s}'], at[f'ankle.{s}']
        F.palm_on(pose, s, knee, ankle, SHIN_AT, L.R_KNEE, L.R_ANKLE, L.n((-sx * 0.6, 0, 1)), L.sub(ankle, knee),
                  gap=0.02, hint=(0, 0, 1), label=f'{label} {s}')
    return pose


SHIN_AT = 0.8   # how far down the shin the palms rest


# the head down to the mat, the back rounded
HEAD = forward(F.trunk(wide(), 48, 62, 88, 118, 128), 'head')

# the chest on the mat, the chin forward on it
CHEST = forward(F.trunk(wide(), 84, 90, 92, 88, 82), 'chest')

POSTURE = L.check({
    'id': 'library:upavistha-konasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'front',
    'frame': {'center_z': 0.5, 'scale': 1.9},
    'transition': 10,
    'stages': [
        {'label': 'Staff', 'pose': SIT, 'hold': 3, 'view': 'quarter', 'frame': F.FOLD_FRAME,
         'notice': ['lower-back', 'breath']},
        {'label': 'Legs wide', 'pose': APART, 'hold': 4, 'notice': ['hamstrings', 'hips']},
        {'label': 'Spine erect', 'pose': ERECT, 'hold': 4, 'notice': ['lower-back', 'breath']},
        {'label': 'Head down', 'pose': HEAD, 'hold': 5, 'notice': ['hamstrings', 'hips']},
        {'label': 'Chest down', 'pose': CHEST, 'hold': 12, 'notice': ['hamstrings', 'hips', 'breath']},
        {'label': 'Rise', 'pose': ERECT, 'hold': 3, 'notice': ['lower-back']},
        {'label': 'Legs together', 'pose': TOGETHER, 'hold': 3, 'view': 'quarter', 'frame': F.FOLD_FRAME, 'notice': ['breath']},
    ],
})
F.report()
