
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Clock, AlertCircle } from 'lucide-react';

dayjs.extend(duration);

export default function Timer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = dayjs();
      const end = dayjs(endTime);
      const diff = end.diff(now);

      if (diff <= 0) {
        setIsExpired(true);
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const d = dayjs.duration(diff);
      return {
        hours: d.hours(),
        minutes: d.minutes(),
        seconds: d.seconds()
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const { hours, minutes, seconds } = timeLeft;
  const isWarning = hours === 0 && minutes < 10;

  if (isExpired) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl">
        <AlertCircle className="w-4 h-4 text-red-400" />
        <span className="text-red-300 font-semibold text-sm">Time Expired</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border backdrop-blur-sm ${
      isWarning 
        ? 'bg-red-500/10 border-red-500/30' 
        : 'bg-blue-500/10 border-blue-500/30'
    }`}>
      <Clock className={`w-4 h-4 ${isWarning ? 'text-red-400' : 'text-blue-400'}`} />
      <div className="flex items-center gap-1 font-mono font-bold">
        <div className={`flex flex-col items-center ${isWarning ? 'text-red-300' : 'text-blue-300'}`}>
          <span className="text-lg leading-none">{String(hours).padStart(2, '0')}</span>
          <span className="text-[8px] opacity-60 uppercase">hrs</span>
        </div>
        <span className={`text-lg ${isWarning ? 'text-red-300' : 'text-blue-300'}`}>:</span>
        <div className={`flex flex-col items-center ${isWarning ? 'text-red-300' : 'text-blue-300'}`}>
          <span className="text-lg leading-none">{String(minutes).padStart(2, '0')}</span>
          <span className="text-[8px] opacity-60 uppercase">min</span>
        </div>
        <span className={`text-lg ${isWarning ? 'text-red-300' : 'text-blue-300'}`}>:</span>
        <div className={`flex flex-col items-center ${isWarning ? 'text-red-300' : 'text-blue-300'}`}>
          <span className="text-lg leading-none">{String(seconds).padStart(2, '0')}</span>
          <span className="text-[8px] opacity-60 uppercase">sec</span>
        </div>
      </div>
    </div>
  );
}
