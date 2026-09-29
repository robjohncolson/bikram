"""Lying on the back to kneeling (after a sit-up, into Fixed Firm, Half Tortoise,
Camel, Rabbit). Sitting up would face the feet — the mirror of the kneel —
so the figure rolls to the side and comes up through the hands and knees.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_bridge_canon', Path(__file__).resolve().parent / '_canon.py')
_canon = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_canon)

POSTURE = _canon.bridge('supine', 'kneeling', ['side', 'fours'])
