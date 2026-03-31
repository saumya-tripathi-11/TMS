import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface Props {
  dueDate: string;
  darkMode: boolean;
}

export const CountdownTimer: React.FC<Props> = ({ dueDate, darkMode }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const due = new Date(dueDate).getTime();
      const diff = due - now;

      if (diff <= 0) {
        setTimeLeft('Overdue');
        setIsUrgent(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setIsUrgent(days < 2);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m left`);
      }
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [dueDate]);

  return (
    <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${
      isUrgent ? 'text-red-500' : darkMode ? 'text-gray-400' : 'text-gray-500'
    }`}>
      <Clock className="w-3 h-3" />
      <span>{timeLeft}</span>
    </div>
  );
};