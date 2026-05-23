interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'suspended';
}

const StatusBadge = ({ status }: StatusBadgeProps) => {

    const statusClasses = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        suspended: 'bg-red-100 text-red-800',
    }
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${statusClasses[status]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;