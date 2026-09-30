"""Library-only proportions. Base tables and measured skin fits stay immutable."""
import math


def library_tables(joints, extras):
    joints, extras = dict(joints), dict(extras)
    for side, sign in (('L', 1), ('R', -1)):
        shoulder = (sign * 0.17, 0, 1.44)
        joints[f'shoulder.{side}'] = shoulder
        at = shoulder
        for stem, length, dx in (('elbow', 0.315, 0.04), ('wrist', 0.26, 0.02), ('fingers', 0.15, 0)):
            at = (at[0] + sign * dx, 0, at[2] - math.sqrt(length * length - dx * dx))
            joints[f'{stem}.{side}'] = at
        wrist, fingers = joints[f'wrist.{side}'], joints[f'fingers.{side}']
        palm = tuple(a + (b - a) * 0.35 for a, b in zip(wrist, fingers))
        extras[f'palm.{side}'] = (palm, f'wrist.{side}', f'fingers.{side}', f'hand.{side}')
    return joints, extras
