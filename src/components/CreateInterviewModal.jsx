import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

// Helper function to get local date string without timezone conversion
const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format date in 12-hour AM/PM format
const formatDateTo12Hour = (date) => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

function CreateInterviewModal({ isOpen, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoEnabled: true,
    chatEnabled: true,
    collaborativeCodeEnabled: true,
    autoTimerEnabled: true,
    scheduledFor: null,
    timeHours: {
      hours: 10,
      minutes: 0,
      seconds: 0,
      period: 'AM'
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Interview title is required');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        title: '',
        description: '',
        videoEnabled: true,
        chatEnabled: true,
        collaborativeCodeEnabled: true,
        autoTimerEnabled: true,
        scheduledFor: null,
        timeHours: {
          hours: 10,
          minutes: 0,
          seconds: 0,
          period: 'AM'
        }
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b p-6 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold">Create Interview</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form - Entire Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Content - Scrollable */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Interview Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Interview Details</h3>
            
            <div>
              <label className="label">
                <span className="label-text font-semibold">Interview Title *</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Senior Frontend Engineer - Round 1"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Description</span>
              </label>
              <textarea
                placeholder="Add interview context, position details, and any instructions for candidates"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="textarea textarea-bordered w-full h-24"
              />
            </div>


          </div>

          {/* Schedule Interview */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Schedule Interview</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Interview Date</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    if (e.target.value) {
                      // Get the time from timeHours state
                      const hours = formData.timeHours?.hours || 10;
                      const minutes = formData.timeHours?.minutes || 0;
                      const seconds = formData.timeHours?.seconds || 0;
                      const period = formData.timeHours?.period || 'AM';
                      
                      // Convert 12-hour to 24-hour format
                      let hour24 = hours;
                      if (period === 'PM' && hours !== 12) hour24 = hours + 12;
                      if (period === 'AM' && hours === 12) hour24 = 0;
                      
                      // Create date-time with preserved time
                      const dateTime = new Date(`${e.target.value}T${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                      setFormData({ ...formData, scheduledFor: dateTime });
                    }
                  }}
                  value={formData.scheduledFor ? getLocalDateString(formData.scheduledFor) : ''}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Start Time (12-hour format)</span>
                </label>
                <div className="flex gap-2 items-center">
                  {/* Hours */}
                  <input
                    type="number"
                    min="01"
                    max="12"
                    placeholder="HH"
                    onChange={(e) => {
                      const hours = parseInt(e.target.value) || 10;
                      const minutes = formData.timeHours?.minutes || 0;
                      const seconds = formData.timeHours?.seconds || 0;
                      const period = formData.timeHours?.period || 'AM';
                      
                      let hour24 = hours;
                      if (period === 'PM' && hours !== 12) hour24 = hours + 12;
                      if (period === 'AM' && hours === 12) hour24 = 0;
                      
                      if (formData.scheduledFor) {
                        const dateStr = getLocalDateString(formData.scheduledFor);
                        const dateTime = new Date(`${dateStr}T${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                        setFormData({ 
                          ...formData, 
                          scheduledFor: dateTime,
                          timeHours: { hours, minutes, seconds, period }
                        });
                      } else {
                        const dateStr = getLocalDateString(new Date());
                        const dateTime = new Date(`${dateStr}T${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                        setFormData({ 
                          ...formData, 
                          scheduledFor: dateTime,
                          timeHours: { hours, minutes, seconds, period }
                        });
                      }
                    }}
                    value={formData.timeHours?.hours || 10}
                    className="input input-bordered input-sm w-16 text-center"
                  />
                  
                  <span className="text-2xl font-bold">:</span>
                  
                  {/* Minutes */}
                  <input
                    type="number"
                    min="00"
                    max="59"
                    placeholder="MM"
                    onChange={(e) => {
                      const hours = formData.timeHours?.hours || 10;
                      const minutes = parseInt(e.target.value) || 0;
                      const seconds = formData.timeHours?.seconds || 0;
                      const period = formData.timeHours?.period || 'AM';
                      
                      let hour24 = hours;
                      if (period === 'PM' && hours !== 12) hour24 = hours + 12;
                      if (period === 'AM' && hours === 12) hour24 = 0;
                      
                      if (formData.scheduledFor) {
                        const dateStr = getLocalDateString(formData.scheduledFor);
                        const dateTime = new Date(`${dateStr}T${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                        setFormData({ 
                          ...formData, 
                          scheduledFor: dateTime,
                          timeHours: { hours, minutes, seconds, period }
                        });
                      } else {
                        const dateStr = getLocalDateString(new Date());
                        const dateTime = new Date(`${dateStr}T${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                        setFormData({ 
                          ...formData, 
                          scheduledFor: dateTime,
                          timeHours: { hours, minutes, seconds, period }
                        });
                      }
                    }}
                    value={(formData.timeHours?.minutes || 0).toString().padStart(2, '0')}
                    className="input input-bordered input-sm w-16 text-center"
                  />
                  
                  <span className="text-2xl font-bold">:</span>
                  
                  {/* Seconds */}
                  <input
                    type="number"
                    min="00"
                    max="59"
                    placeholder="SS"
                    onChange={(e) => {
                      const hours = formData.timeHours?.hours || 10;
                      const minutes = formData.timeHours?.minutes || 0;
                      const seconds = parseInt(e.target.value) || 0;
                      const period = formData.timeHours?.period || 'AM';
                      
                      let hour24 = hours;
                      if (period === 'PM' && hours !== 12) hour24 = hours + 12;
                      if (period === 'AM' && hours === 12) hour24 = 0;
                      
                      if (formData.scheduledFor) {
                        const dateStr = getLocalDateString(formData.scheduledFor);
                        const dateTime = new Date(`${dateStr}T${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                        setFormData({ 
                          ...formData, 
                          scheduledFor: dateTime,
                          timeHours: { hours, minutes, seconds, period }
                        });
                      } else {
                        const dateStr = getLocalDateString(new Date());
                        const dateTime = new Date(`${dateStr}T${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                        setFormData({ 
                          ...formData, 
                          scheduledFor: dateTime,
                          timeHours: { hours, minutes, seconds, period }
                        });
                      }
                    }}
                    value={(formData.timeHours?.seconds || 0).toString().padStart(2, '0')}
                    className="input input-bordered input-sm w-16 text-center"
                  />
                  
                  {/* AM/PM Selector */}
                  <select
                    value={formData.timeHours?.period || 'AM'}
                    onChange={(e) => {
                      const hours = formData.timeHours?.hours || 10;
                      const minutes = formData.timeHours?.minutes || 0;
                      const seconds = formData.timeHours?.seconds || 0;
                      const period = e.target.value;
                      
                      let hour24 = hours;
                      if (period === 'PM' && hours !== 12) hour24 = hours + 12;
                      if (period === 'AM' && hours === 12) hour24 = 0;
                      
                      if (formData.scheduledFor) {
                        const dateStr = getLocalDateString(formData.scheduledFor);
                        const dateTime = new Date(`${dateStr}T${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                        setFormData({ 
                          ...formData, 
                          scheduledFor: dateTime,
                          timeHours: { hours, minutes, seconds, period }
                        });
                      } else {
                        const dateStr = getLocalDateString(new Date());
                        const dateTime = new Date(`${dateStr}T${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                        setFormData({ 
                          ...formData, 
                          scheduledFor: dateTime,
                          timeHours: { hours, minutes, seconds, period }
                        });
                      }
                    }}
                    className="select select-bordered select-sm"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>

            {formData.scheduledFor && (
              <div className="alert alert-success">
                <span>✅ Scheduled for {formatDateTo12Hour(formData.scheduledFor)}</span>
              </div>
            )}

            <p className="text-sm text-base-content/60">Leave blank to create interview as draft</p>
          </div>

          {/* Interview Settings */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Interview Settings</h3>
            
            <div className="space-y-3 bg-base-200 p-4 rounded-lg">
              <label className="label cursor-pointer">
                <span className="label-text">🎥 Enable Video Call</span>
                <input
                  type="checkbox"
                  checked={formData.videoEnabled}
                  onChange={(e) => setFormData({ ...formData, videoEnabled: e.target.checked })}
                  className="checkbox checkbox-primary"
                />
              </label>

              <label className="label cursor-pointer">
                <span className="label-text">💬 Enable Chat</span>
                <input
                  type="checkbox"
                  checked={formData.chatEnabled}
                  onChange={(e) => setFormData({ ...formData, chatEnabled: e.target.checked })}
                  className="checkbox checkbox-primary"
                />
              </label>

              <label className="label cursor-pointer">
                <span className="label-text">💻 Enable Code Editor</span>
                <input
                  type="checkbox"
                  checked={formData.collaborativeCodeEnabled}
                  onChange={(e) => setFormData({ ...formData, collaborativeCodeEnabled: e.target.checked })}
                  className="checkbox checkbox-primary"
                />
              </label>

              <label className="label cursor-pointer">
                <span className="label-text">⏱️ Enable Auto Timer</span>
                <input
                  type="checkbox"
                  checked={formData.autoTimerEnabled}
                  onChange={(e) => setFormData({ ...formData, autoTimerEnabled: e.target.checked })}
                  className="checkbox checkbox-primary"
                />
              </label>
            </div>
          </div>

          {/* Info Message */}
          <div className="alert alert-info">
            <span>ℹ️ You can add questions during the interview when both of you have joined. This way you can customize questions based on the conversation.</span>
          </div>
          </div>

          {/* Action Buttons - Sticky Footer */}
          <div className="border-t p-6 flex gap-3 justify-end flex-shrink-0 bg-base-100">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Creating...' : 'Create Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateInterviewModal;
