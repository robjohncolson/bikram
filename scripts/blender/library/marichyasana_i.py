"""
Marichyasana I (the sage Marichi's pose) — library sheet, live figure only.

From the staff: the left knee comes up, the sole flat on the mat; the
trunk leans forward and the left shoulder goes forward against the inside
of the upright shin, the arm down in front of it, the right hand behind
the back; the trunk folds forward over the straight right leg, the head
toward the right knee; up again, the knee still up, and the loop returns
to the staff before repeating on the other side. The hands release by
returning around the raised knee before the leg straightens.

The illustrated bind is not completed: the forward palm stays on the mat
and the rear hand reaches behind the waist. The longer arms are used with
flat planted hands and a wider rear elbow path. FOLDS_REPORT=1 reports the
actual wrist separation, not a claim that this preparation is a bind.
The raised knee stays wide to clear the trunk's hull.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_library_folds', Path(__file__).resolve().parent / '_folds.py')
F = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(F)
L = F.L
L.begin('marichyasana-i', skeleton='library')

ANKLE = (0.08, -0.34, 0.085)          # the raised leg's foot (left), from the seat
KNEE_OUT = 0.34                       # the raised knee's distance out from the midline
SHOULDER_IN = L.n((1, -0.8, -0.2))    # the left shoulder driven forward and down, the armpit to the shin
FRONT_OF_FOOT = (0.24, -0.12, 0.11)    # the left wrist from the ankle: out past the foot and ahead of it
                                      # (z: absolute, the palm on the mat)


def legs():
    """The right leg straight, the left knee up, its sole flat on the mat."""
    pose = F.sit()
    F.straight(pose, 'R')
    a = (ANKLE[0], F.SEAT[1] + ANKLE[1], ANKLE[2])
    hip = L.fk(pose)['hip.L']
    L.set_leg(pose, 'L', L.knee_on(hip, a, (1, 0, 0), KNEE_OUT, (0, -0.3, 1)), a)
    pose['foot.L'] = L.n((-0.1, -1, -0.12))
    return pose


def knee_up():
    pose = legs()
    F.palms_down(pose, out=0.24, back=0.05, only='R')           # clear of the hip on its way behind the back
    return F.palms_down(pose, out=0.34, back=-0.1, only='L')   # the left palm wide, clear of the rising thigh


def hold_knee():
    """The midpoint that takes the left arm over the knee: the trunk leaning
    a little, the left palm on the outside of the knee (from the mat
    straight to the front of the shin, the arm swept through the leg)."""
    pose = F.trunk(legs(), 12, 18, 20, 15, 10, x=-0.05)
    F.palms_down(pose, out=0.24, back=0.05, only='R')
    at = L.fk(pose)
    F.palm_on(pose, 'L', at['hip.L'], at['knee.L'], 0.92, L.R_HIP, L.R_KNEE, (1, -0.3, 0.4),
              L.sub(at['ankle.L'], at['knee.L']), gap=0.02, hint=(1, 0.3, 0.3), label='hand on the knee')
    return pose


def arms(pose, label):
    """The left shoulder forward against the inside of the shin, the arm down
    in front of it to the mat before the foot; the right hand behind the
    back, reaching toward the left side."""
    pose['clavicle.L'] = SHOULDER_IN
    a = L.fk(pose)['ankle.L']
    F.reach(pose, 'L', (a[0] + FRONT_OF_FOOT[0], a[1] + FRONT_OF_FOOT[1], L.WRIST_Z), (1, 0.4, 0.3),
            L.flat_hand((0, -1, 0)), label=f'left hand before the foot ({label})')
    at = L.fk(pose)
    _, _, front = L.trunk_frame(at)
    behind = L.add(at['waist'], front, -0.16)
    F.reach(pose, 'R', L.add(behind, (0.06, 0, 0)), (-1, 1.5, 0.3), L.n((1, 0.2, -0.3)), label=f'right hand behind ({label})')
    at = L.fk(pose)
    F.SHORT[f'the book: the hands clasped behind ({label}), gap between the wrists'] = L.dist(at['wrist.L'], at['wrist.R'])
    return pose


SIT = F.staff()
KNEE = knee_up()
HOLD = hold_knee()
FORWARD = arms(F.trunk(legs(), 30, 45, 50, 45, 30, x=-0.1), 'upright')
FOLD = arms(F.trunk(legs(), 30, 50, 105, 105, 105, x=-0.1), 'folded')

POSTURE = L.check({
    'id': 'library:marichyasana-i',
    'position': {'start': 'seated', 'end': 'seated'},
    'view': 'side',
    'frame': {'center_z': 0.42, 'scale': 1.32},
    'transition': 10,
    'stages': [
        {'label': 'Staff', 'pose': SIT, 'hold': 3, 'notice': ['lower-back', 'breath']},
        {'label': 'Left knee up', 'pose': KNEE, 'hold': 4, 'notice': ['hips', 'feet']},
        {'label': 'Hand to knee', 'pose': HOLD, 'hold': 3, 'notice': ['shoulders']},
        {'label': 'Head to knee', 'pose': FOLD, 'hold': 10, 'notice': ['hamstrings', 'shoulders', 'breath']},
        {'label': 'Arm back', 'pose': HOLD, 'hold': 3, 'notice': ['shoulders']},
        {'label': 'Knee up', 'pose': KNEE, 'hold': 3, 'notice': ['breath']},
        {'label': 'Staff between sides', 'pose': SIT, 'hold': 3, 'notice': ['breath']},
        {'label': 'Right knee up', 'pose': L.mirror(KNEE), 'hold': 4, 'notice': ['hips', 'feet']},
        {'label': 'Right hand to knee', 'pose': L.mirror(HOLD), 'hold': 3, 'notice': ['shoulders']},
        {'label': 'Left leg fold', 'pose': L.mirror(FOLD), 'hold': 10, 'notice': ['hamstrings', 'shoulders', 'breath']},
        {'label': 'Right arm back', 'pose': L.mirror(HOLD), 'hold': 3, 'notice': ['shoulders']},
        {'label': 'Rise on second side', 'pose': L.mirror(KNEE), 'hold': 3, 'notice': ['breath']},
    ],
})
F.report()
