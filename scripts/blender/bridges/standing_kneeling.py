"""Bend the knees, then lower them to the floor and lift the chest to kneel."""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_bridge_canon', Path(__file__).resolve().parent / '_canon.py')
_canon = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_canon)

POSTURE = _canon.bridge('standing', 'kneeling', ['crouch'], views={0: 'quarter'})
