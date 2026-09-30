"""Rise through hands and knees, sit with the legs tucked to the side,
then sweep the feet forward along the floor and slide the legs long."""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('_bridge_canon', Path(__file__).resolve().parent / '_canon.py')
_canon = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_canon)

POSTURE = _canon.bridge('prone', 'seated', ['fours', 'side-sit', 'knees-down'])
