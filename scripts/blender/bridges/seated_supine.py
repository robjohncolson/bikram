"""Sitting to lying on the back (a seated set's savasana): draw the knees up,
swivel round on the seat, then lie back down.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_bridge_canon', Path(__file__).resolve().parent / '_canon.py')
_canon = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_canon)

POSTURE = _canon.bridge('seated', 'supine', ['knees-up', 'swivel', 'sat-up'])
