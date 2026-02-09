import React, { useState, useEffect, useMemo } from 'react';

const CountdownTimer = ({ expiryDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(expiryDate) - +new Date();
      let timeLeft = {};

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      } else {
        timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      return timeLeft;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryDate]);

  const timerItems = useMemo(() => [
    { label: 'يوم', value: timeLeft.days },
    { label: 'ساعة', value: timeLeft.hours },
    { label: 'دقيقة', value: timeLeft.minutes },
    { label: 'ثانية', value: timeLeft.seconds },
  ], [timeLeft]);

  return (
    <div className="flex flex-row-reverse justify-center gap-4 my-6" style={{ contain: 'layout style' }}>
      {timerItems.map((item, index) => (
        <div key={index} className="flex flex-col items-center bg-white shadow-md rounded-lg p-3 min-w-[70px] border border-green-100">
          <span className="text-2xl font-bold text-green-600 font-mono">
            {String(item.value).padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-500 font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default React.memo(CountdownTimer);