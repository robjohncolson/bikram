"""Sitting to kneeling (Spine Twisting into Kapalbhati): draw the knees up, let them
fall to one side, tuck the feet, rise onto the knees. Ends on Kapalbhati's framing.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_bridge_canon', Path(__file__).resolve().parent / '_canon.py')
_canon = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_canon)

POSTURE = _canon.bridge('seated', 'kneeling', ['knees-up', 'knees-down', 'side-sit'], end_frame={'center_z': 0.55, 'scale': 1.4})
