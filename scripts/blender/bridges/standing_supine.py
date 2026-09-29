"""Standing to lying on the back (Toe Stand into Savasana): kneel down, forward
onto the hands and knees, over onto the side, onto the back.
"""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_bridge_canon', Path(__file__).resolve().parent / '_canon.py')
_canon = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_canon)

POSTURE = _canon.bridge('standing', 'supine', ['kneel', 'fours', 'side'], views={0: 'quarter'})
