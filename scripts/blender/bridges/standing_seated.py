"""Bend the knees, lower onto the seat with knees up, then slide the legs long."""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_bridge_canon', Path(__file__).resolve().parent / '_canon.py')
_canon = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_canon)

POSTURE = _canon.bridge('standing', 'seated', ['crouch', 'knees-up'], views={0: 'quarter'})
