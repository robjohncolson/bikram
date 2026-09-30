"""
Siddhasana — library sheet, live figure only.

From sitting with the legs straight: the left knee bends and its heel is
drawn in to the perineum; the right foot is lifted over the left ankle and
set down with its heel stacked just above, at the pubic bone, the right
shin crossing over the left and both knees on the mat; the seat held, the
spine erect, the backs of the wrists on the knees; out the same way. The
legs come from `_lib.siddha` (the pelvis's own frame). Shape from the
book's photograph; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lotus', Path(__file__).resolve().parent / '_lotus.py')
LT = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(LT)
L = LT.L
L.begin('siddhasana', skeleton='library')

UP = (0, 0, 1)
OUT = 0.36   # the palms wide of and behind the hips while the legs fold (clear of the
BACK = 0.04  # thighs on the way to the knees)

SIT = L.sit()
L.legs_forward(SIT)
LT.palms_beside(SIT, out=OUT, back=BACK)

# the left heel in to the perineum, the right leg still straight
LEFT_IN = L.sit()
L.legs_forward(LEFT_IN, apart=0.25)   # the straight leg a little out, so the heel comes in beside its thigh
L.siddha(LEFT_IN, first='L', both=False)
LT.palms_beside(LEFT_IN, out=OUT, back=BACK)
L.hands_on_knees(LEFT_IN, only='L')

SEAT = L.sit()
L.siddha(SEAT, first='L')
L.hands_on_knees(SEAT)

# the right foot carried over the left ankle, above where its heel will rest
RIGHT_OVER = {**LEFT_IN}
L.carry_foot(RIGHT_OVER, 'R', L.fk(SEAT)['ankle.R'], UP, up=0.1, hint=(-1, -0.3, 0.8))
LT.palms_beside(RIGHT_OVER, out=OUT, back=BACK)
L.hands_on_knees(RIGHT_OVER)   # the right hand guides the knee over and down; the left rests on its knee

# the common mistake: sitting back on the heels' height with the lower back
# rounded, the chest caved and the head forward
_SLUMP = {**SEAT, 'pelvis': L.n((0, 0.2, 1)), 'spine.lower': L.n((0, -0.15, 1)), 'spine.upper': L.n((0, -0.45, 0.9)),
          'neck': L.n((0, -0.55, 0.85)), 'head': L.n((0, -0.4, 0.9))}
L.hands_on_knees(_SLUMP)
GHOST = L.diff(_SLUMP, SEAT)

GUIDES = [
    {'from': (0, L.SEAT[1], 0.0), 'to': (0, L.SEAT[1], 0.95)},   # back, neck and head erect over the seat
]

POSTURE = {
    'id': 'library:siddhasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'front',
    # the knees sit wider than the lotus's (and one leg is straight out in
    # front while the heels go in): a little more room than LOTUS_FRAME
    'frame': {'center_z': 0.42, 'scale': 1.12},
    'transition': 10,
    'stages': [
        {'label': 'Sit', 'pose': SIT, 'hold': 4, 'view': 'quarter', 'frame': L.SEATED_FRAME,
         'notice': ['lower-back', 'breath']},
        {'label': 'Left heel in', 'pose': LEFT_IN, 'hold': 4, 'notice': ['hips', 'feet']},
        {'label': 'Right foot over', 'pose': RIGHT_OVER, 'hold': 4, 'notice': ['hips']},
        {'label': 'Siddhasana', 'pose': SEAT, 'hold': 14, 'guides': GUIDES, 'ghost': GHOST,
         'notice': ['hips', 'lower-back', 'neck', 'breath']},
        {'label': 'Right foot off', 'pose': RIGHT_OVER, 'hold': 3, 'notice': ['hips']},
        {'label': 'Left heel only', 'pose': LEFT_IN, 'hold': 3, 'notice': ['hips']},
    ],
}

# The second run includes the straight-leg rest before reversing the heels.
first_run = POSTURE['stages']
second_run = []
for st in first_run:
    label = st['label'].replace('Left', 'SECOND').replace('Right', 'Left').replace('SECOND', 'Right')
    other = {**st, 'label': label + ' (reversed)', 'pose': L.mirror(st['pose'])}
    if 'ghost' in st:
        other['ghost'] = L.mirror(st['ghost'])
    second_run.append(other)
POSTURE['stages'] = first_run + second_run
POSTURE = L.check(POSTURE)
