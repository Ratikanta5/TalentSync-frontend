import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

function ScheduledCountdownTimer({ scheduledFor }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!scheduledFor) return;

    const calculateTimeLeft = () => {
      const scheduledTime = new Date(scheduledFor).getTime();
      const now = new Date().getTime();
      const difference = scheduledTime - now;

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [scheduledFor]);

  if (!timeLeft) {
    return null;
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-4 border border-primary/30">
      <div className="flex items-center gap-3 mb-3">
        <Clock className="w-5 h-5 text-primary animate-pulse" />
        <p className="font-semibold text-sm">Scheduled Interview Countdown</p>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-base-100 rounded p-2 text-center">
          <p className="text-lg font-bold text-primary">{String(timeLeft.days).padStart(2, '0')}</p>
          <p className="text-xs text-base-content/60">Days</p>
        </div>
        <div className="bg-base-100 rounded p-2 text-center">
          <p className="text-lg font-bold text-primary">{String(timeLeft.hours).padStart(2, '0')}</p>
          <p className="text-xs text-base-content/60">Hours</p>
        </div>
        <div className="bg-base-100 rounded p-2 text-center">
          <p className="text-lg font-bold text-primary">{String(timeLeft.minutes).padStart(2, '0')}</p>
          <p className="text-xs text-base-content/60">Minutes</p>
        </div>
        <div className="bg-base-100 rounded p-2 text-center">
          <p className="text-lg font-bold text-primary">{String(timeLeft.seconds).padStart(2, '0')}</p>
          <p className="text-xs text-base-content/60">Seconds</p>
        </div>
      </div>

      <p className="text-xs text-base-content/70 text-center">
        📅 Scheduled for: <span className="font-semibold">{formatDate(scheduledFor)}</span>
      </p>
    </div>
  );
}

export default ScheduledCountdownTimer;
