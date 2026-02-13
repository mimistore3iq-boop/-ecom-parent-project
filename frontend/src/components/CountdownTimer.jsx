
import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        يوم: Math.floor(difference / (1000 * 60 * 60 * 24)),
        ساعة: Math.floor((difference / (1000 * 60 * 60)) % 24),
        دقيقة: Math.floor((difference / 1000 / 60) % 60),
        ثانية: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    timerComponents.push(
      <div key={interval} className="flex flex-col items-center bg-gray-50 rounded-lg p-2 min-w-[60px] border border-gray-100 shadow-sm">
        <span className="text-xl font-bold text-indigo-600">
          {timeLeft[interval] < 10 ? `0${timeLeft[interval]}` : timeLeft[interval]}
        </span>
        <span className="text-[10px] text-gray-500 font-medium">{interval}</span>
      </div>
    );
  });

  if (timerComponents.length === 0) return null;

  return (
    <div className="my-6 p-4 bg-white border border-red-100 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        <h4 className="text-gray-700 font-bold text-sm">العرض ينتهي خلال</h4>
      </div>
      <div className="flex justify-between gap-2" dir="rtl">
        {timerComponents}
      </div>
    </div>
  );
};

export default CountdownTimer;
