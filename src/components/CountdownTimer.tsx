import React, { useState, useEffect } from 'react';

export const CountdownTimer = ({ expiryTime, status }: { expiryTime: string, status: string }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (status !== 'available') {
      setTimeLeft(status === 'claimed' ? 'Claimed' : 'Expired');
      return;
    }
    const update = () => {
      const diff = new Date(expiryTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Escalating...');
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiryTime, status]);

  return <span className={timeLeft === 'Escalating...' ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-200'}>{timeLeft}</span>;
};
