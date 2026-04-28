import { IssueStatus } from '../types';

type Props = { status: IssueStatus };

const label = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved' };
const classMap = {
  open: 'badge badge-open',
  in_progress: 'badge badge-in-progress',
  resolved: 'badge badge-resolved',
};

export function StatusBadge({ status }: Props) {
  return <span className={classMap[status]}>{label[status]}</span>;
}
