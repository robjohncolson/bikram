import { Link } from 'react-router-dom';
import { poses } from '../data';
import './PoseDetail.css';

export function NotFound() {
  const first = poses[0];
  const last = poses.at(-1)!;
  return (
    <div className="page container pd-missing">
      <p className="eyebrow">26 &amp; 2</p>
      <h1>Page not found</h1>
      <p className="text-soft pd-missing-copy">
        Nothing in the sequence lives at this address. The class runs from
        item {first.order}, {first.englishName}, to item {last.order}, {last.englishName}.
      </p>
      <Link to="/sequence" className="pd-missing-link">
        ← Back to the sequence
      </Link>
    </div>
  );
}
