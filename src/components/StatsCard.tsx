import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  yellow: 'bg-yellow-400 text-white',
  red: 'bg-red-500 text-white',
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = 'blue',
}) => {
  const changeColor =
    changeType === 'increase'
      ? 'text-green-600'
      : changeType === 'decrease'
      ? 'text-red-600'
      : 'text-gray-600';

  return (
    <div className="bg-white rounded-lg shadow p-5 flex items-center space-x-4 border border-gray-200">
      <div className={`p-3 rounded-full ${colorClasses[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {change && <p className={`text-sm ${changeColor}`}>{change}</p>}
      </div>
    </div>
  );
};

export default StatsCard;