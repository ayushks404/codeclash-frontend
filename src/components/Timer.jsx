// src/components/Timer.jsx
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export default function Timer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = dayjs();
      const end = dayjs(endTime);
      const diff = end.diff(now);

      if (diff <= 0) {
        return '00:00:00';
      }

      const d = dayjs.duration(diff);
      const hours = String(d.hours()).padStart(2, '0');
      const minutes = String(d.minutes()).padStart(2, '0');
      const seconds = String(d.seconds()).padStart(2, '0');
      
      return `${hours}:${minutes}:${seconds}`;
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div style={{ 
        textAlign: 'center', 
        fontSize: '24px', 
        fontWeight: 'bold', 
        margin: '10px 0',
        padding: '10px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        border: '1px solid #ddd'
    }}>
      Time Left: {timeLeft}
    </div>
  );
}