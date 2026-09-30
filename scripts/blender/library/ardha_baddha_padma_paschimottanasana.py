"""
Ardha Baddha Padma Paschimottanasana (the bound half-lotus forward fold)
— library sheet, live figure only.

From sitting with the legs straight, as the book sets it out: the left
knee bends and the left foot is carried up and set on the right thigh,
sole up; the left arm goes round the back toward the left big toe and the
right hand reaches down the right leg, the back concave and the gaze up;
the trunk folds forward over the straight leg; then up, the hands free,
the left foot lifted off, and the legs straight again. The other side is
the step left unbound on the page.

Rig limits, drawn as far as they go and reported: the left hand stops
6-8 cm short of the big toe; the right hand takes the shin, the ankle
being beyond the arm; the trunk rests on the half-lotus foot, so the head
stops about 21 cm from the knee (`_lotus.HALF_FOLD`). Shape from the
book's photographs; the stages are ours.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_lotus', Path(__file__).resolve().parent / '_lotus.py')
LT = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(LT)
L = LT.L
L.begin('ardha_baddha_padma_paschimottanasana')

UP = (0, 0, 1)



def hands(pose):
    """The right palm on the mat outside the right knee (clear of the left
    foot as it crosses), the left palm on the mat behind the left hip (it
    goes round the waist from there; from beside the hip it swept through
    the pelvis)."""
    LT.palm_behind(pose, 'R', out=0.2, back=-0.3)
    return LT.palm_behind(pose, 'L')


SIT = L.sit()
L.legs_forward(SIT)
hands(SIT)

# the left foot on the right thigh, the hands on the mat
HALF = hands(LT.half_seat())

# on its way: the left knee bent up and out, the foot lifted over its landing
LEFT_UP = L.sit()
L.legs_forward(LEFT_UP)
L.carry_foot(LEFT_UP, 'L', L.fk(HALF)['ankle.L'], UP, up=0.12, hint=(1, -0.2, 0.8))
hands(LEFT_UP)

# the catch: the left arm round the back, the right hand down the leg,
# the back concave and the head up
CATCH = LT.half_seat(LT.HALF_UP)
LT.bind(CATCH, 'L', LT.HALF_BIND_UP)
LT.hand_down_leg(CATCH, 'R')

FOLD = LT.half_seat(LT.HALF_FOLD)
LT.hand_down_leg(FOLD, 'R')
LT.bind(FOLD, 'L', LT.HALF_BIND_FOLD)

FRAME = {'center_z': 0.42, 'scale': 1.5}

POSTURE = L.check({
    'id': 'library:ardha-baddha-padma-paschimottanasana',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'quarter',
    'frame': FRAME,
    'transition': 10,
    'stages': [
        {'label': 'Sit', 'pose': SIT, 'hold': 4, 'notice': ['lower-back', 'breath']},
        {'label': 'Left foot up', 'pose': LEFT_UP, 'hold': 3, 'notice': ['hips']},
        {'label': 'Half lotus', 'pose': HALF, 'hold': 4, 'notice': ['hips', 'feet']},
        {'label': 'Catch and look up', 'pose': CATCH, 'hold': 5, 'notice': ['shoulders', 'lower-back', 'breath']},
        {'label': 'Fold', 'pose': FOLD, 'hold': 14, 'view': 'side',
         'notice': ['hamstrings', 'lower-back', 'quads', 'breath']},
        {'label': 'Head up', 'pose': CATCH, 'hold': 3, 'notice': ['lower-back', 'breath']},
        {'label': 'Hands free', 'pose': HALF, 'hold': 3, 'notice': ['hips']},
        {'label': 'Left foot off', 'pose': LEFT_UP, 'hold': 3, 'notice': ['hips']},
    ],
})
