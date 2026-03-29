import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

function InterviewTimer({ 
  totalMinutes = 60, 
  startTime = Date.now(),
  isActive = true,
  onTimeUp = null 
}) {
  const [elapsed, setElapsed] = useState(0);
  const [remaining, setRemaining] = useState(totalMinutes * 60);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const totalSeconds = totalMinutes * 60;
      const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

      setElapsed(elapsedSeconds);
      setRemaining(remainingSeconds);

      if (remainingSeconds === 0 && !isTimeUp) {
        setIsTimeUp(true);
        onTimeUp?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime, totalMinutes, isTimeUp, onTimeUp]);

  // Calculate progress percentage
  const totalSeconds = totalMinutes * 60;
  const progressPercent = (elapsed / totalSeconds) * 100;

  // Format time display (HH:MM:SS)
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format time in 12-hour AM/PM format
  const format12Hour = (date) => {
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Calculate interview end time
  const endTime = new Date(startTime + remaining * 1000);

  // Calculate rotation for progress circle
  const circumference = 2 * Math.PI * 85; // radius 85
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const remainingMinutes = Math.floor(remaining / 60);
  const remainingSeconds = remaining % 60;

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Clock Face Container */}
      <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-base-100 to-base-200 shadow-2xl flex items-center justify-center border-4 border-primary/30">
        
        {/* Outer Circle Progress Ring */}
        <svg 
          className="absolute inset-0 w-full h-full transform -rotate-90"
          viewBox="0 0 180 180"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}
        >
          {/* Background circle */}
          <circle
            cx="90"
            cy="90"
            r="85"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-base-300"
          />
          
          {/* Progress circle */}
          <circle
            cx="90"
            cy="90"
            r="85"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`text-primary transition-all duration-1000 ${
              isTimeUp ? 'text-error' : ''
            }`}
          />

          {/* Hour markers */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour) => {
            const angle = (hour * 30) * (Math.PI / 180);
            const x1 = 90 + 75 * Math.cos(angle);
            const y1 = 90 + 75 * Math.sin(angle);
            const x2 = 90 + 82 * Math.cos(angle);
            const y2 = 90 + 82 * Math.sin(angle);
            return (
              <line
                key={`hour-${hour}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="2"
                className="text-base-content/20"
              />
            );
          })}
        </svg>

        {/* Center Content */}
        <div className="absolute flex flex-col items-center justify-center gap-2">
          {/* Clock Icon */}
          <Clock className="w-8 h-8 text-primary/60 mb-1" />

          {/* Time Display */}
          <div className="text-center">
            <div className={`font-mono text-5xl font-bold ${
              isTimeUp ? 'text-error' : 'text-primary'
            }`}>
              {formatTime(remaining)}
            </div>
            <p className="text-xs text-base-content/60 mt-2 font-semibold">
              {isTimeUp ? 'TIME UP!' : 'remaining'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Below Timer */}
      <div className="flex gap-8 mt-4">
        {/* Elapsed Time */}
        <div className="text-center">
          <p className="text-sm text-base-content/60 mb-1">Elapsed</p>
          <p className="font-mono text-lg font-bold text-primary">
            {formatTime(elapsed)}
          </p>
        </div>

        {/* Total Duration */}
        <div className="divider divider-horizontal mx-0" />

        <div className="text-center">
          <p className="text-sm text-base-content/60 mb-1">Total</p>
          <p className="font-mono text-lg font-bold text-base-content/70">
            {formatTime(totalMinutes * 60)}
          </p>
        </div>
      </div>

      {/* Clock Time Display (12-hour format) */}
      <div className="flex gap-8 mt-6 bg-base-200 p-4 rounded-lg w-full">
        {/* Current Time */}
        <div className="flex-1 text-center">
          <p className="text-xs text-base-content/60 mb-2 font-semibold">CURRENT TIME</p>
          <p className="font-mono text-2xl font-bold text-primary">
            {format12Hour(new Date())}
          </p>
        </div>

        <div className="divider divider-horizontal mx-0" />

        {/* Interview End Time */}
        <div className="flex-1 text-center">
          <p className="text-xs text-base-content/60 mb-2 font-semibold">END TIME</p>
          <p className={`font-mono text-2xl font-bold ${
            isTimeUp ? 'text-error' : 'text-success'
          }`}>
            {format12Hour(endTime)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full mt-4 px-2">
        <div className="bg-base-300 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isTimeUp ? 'bg-error' : 'bg-primary'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Status Badge */}
      {isTimeUp && (
        <div className="badge badge-lg badge-error gap-2 mt-2">
          ⏰ Interview Time Completed
        </div>
      )}

      {!isTimeUp && remaining < 300 && (
        <div className="badge badge-lg badge-warning gap-2 mt-2">
          ⏱️ Less than 5 minutes remaining
        </div>
      )}
    </div>
  );
}

export default InterviewTimer;
