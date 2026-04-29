import { SeriousLevel } from '../types';

type Props = { level: SeriousLevel };

const label = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };
const classMap = {
  low: 'badge badge-low',
  medium: 'badge badge-medium',
  high: 'badge badge-high',
  critical: 'badge badge-critical',
};

export function SeriousLevelBadge({ level }: Props) {
  return <span className={classMap[level]}>{label[level]}</span>;
}
