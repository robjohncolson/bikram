"""Lying on the back to sitting (after a sit-up, into Head to Knee and Stretching
or Spine Twisting): sit up facing the feet, swivel round on the seat, slide the legs long.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_bridge_canon', Path(__file__).resolve().parent / '_canon.py')
_canon = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_canon)

POSTURE = _canon.bridge('supine', 'seated', ['sat-up', 'swivel', 'knees-up'])
