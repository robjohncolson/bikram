"""Arm placements for the inversion family, using the caller's selected rig."""

def configure(L):
    """Install family placements on this sheet's private helper instance."""
    support = L.hands_on_back
    separate = L.arms_long
    def hands_on_back(pose, f=0.95, theta=42.0):
        if f == 1.0:
            return L.palms_to_back(pose, (0, 1, 0), f=f, theta=20.0, fingers=-0.3)
        return support(pose, f=f, theta=theta)
    def arms_long(pose, clasp=True):
        if not clasp:
            return separate(pose, clasp=False)
        at = L.fk(pose)
        for side, sx in (('L', 1), ('R', -1)):
            sh = at[f'shoulder.{side}']
            wrist = (sx * 0.10, sh[1] + 0.55, 0.055)
            L.arm(pose, side, wrist, (0, 0, 1), L.n((-sx * 0.8, 1, 0)))
        return pose
    L.hands_on_back = hands_on_back
    L.arms_long = arms_long


def release_back(L, supported):
    """Keep the elbows in place while the hands lift out from the back."""
    pose = {**supported}
    for side, sx in (('L', 1), ('R', -1)):
        pose[f'forearm.{side}'] = L.n((sx * 0.7, 0, 0.85))
        pose[f'hand.{side}'] = L.n((sx * 0.7, 0, 0.85))
    return pose
