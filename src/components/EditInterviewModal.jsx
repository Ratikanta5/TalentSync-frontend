import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../lib/axios';

function EditInterviewModal({ isOpen, onClose, interview, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoEnabled: true,
    chatEnabled: true,
    collaborativeCodeEnabled: true,
    autoTimerEnabled: true,
    scheduledFor: null,
    timeHours: { hours: '02', minutes: '00', seconds: '00', period: 'PM' }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (interview && isOpen) {
      setFormData(prev => ({
        ...prev,
        title: interview.title || '',
        description: interview.description || '',
        videoEnabled: interview.settings?.videoEnabled ?? true,
        chatEnabled: interview.settings?.chatEnabled ?? true,
        collaborativeCodeEnabled: interview.settings?.collaborativeCodeEnabled ?? true,
        autoTimerEnabled: interview.settings?.autoTimerEnabled ?? true,
        scheduledFor: interview.scheduledFor ? new Date(interview.scheduledFor) : null
      }));
    }
  }, [interview, isOpen]);

  const formatDateTo12Hour = (date) => {
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

  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setFormData(prev => ({
      ...prev,
      scheduledFor: newDate
    }));
  };

  const handleTimeChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      timeHours: {
        ...prev.timeHours,
        [field]: value
      }
    }));
  };

  const handleToggle = (setting) => {
    setFormData(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Interview title is required');
      return;
    }

    try {
      setLoading(true);

      let scheduledFor = null;
      if (formData.scheduledFor) {
        const date = getLocalDateString(formData.scheduledFor);
        const hours = String(formData.timeHours.hours).padStart(2, '0');
        const minutes = String(formData.timeHours.minutes).padStart(2, '0');
        const seconds = String(formData.timeHours.seconds).padStart(2, '0');

        let hour24 = parseInt(hours);
        if (formData.timeHours.period === 'PM' && hour24 !== 12) {
          hour24 += 12;
        } else if (formData.timeHours.period === 'AM' && hour24 === 12) {
          hour24 = 0;
        }

        scheduledFor = new Date(`${date}T${String(hour24).padStart(2, '0')}:${minutes}:${seconds}`);
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        timeLimit: formData.timeLimit,
        videoEnabled: formData.videoEnabled,
        chatEnabled: formData.chatEnabled,
        collaborativeCodeEnabled: formData.collaborativeCodeEnabled,
        autoTimerEnabled: formData.autoTimerEnabled,
        scheduledFor: scheduledFor ? scheduledFor.toISOString() : null
      };

      await onSubmit(payload);
      toast.success('Interview updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating interview:', error);
      toast.error('Failed to update interview');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !interview) return null;

  const canEdit = interview.status === 'draft' || interview.status === 'scheduled' || interview.status === 'pending' || interview.status === 'rejected';

  if (!canEdit) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center gap-3 mb-4 p-3 bg-warning/10 rounded-lg border border-warning">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
            <p>Cannot edit interviews that are active or completed</p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-block"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b p-6 flex justify-between items-center sticky top-0 bg-base-100 z-10">
          <h2 className="text-2xl font-bold">Edit Interview</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title and Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Interview Details</h3>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Interview Title *</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Senior React Developer"
                className="input input-bordered w-full"
                disabled={loading}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Description</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Interview details, topics to cover, etc."
                className="textarea textarea-bordered w-full h-24"
                disabled={loading}
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="divider"></div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Schedule Interview</h3>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Date</span>
              </label>
              <input
                type="date"
                value={formData.scheduledFor ? getLocalDateString(formData.scheduledFor) : ''}
                onChange={handleDateChange}
                min={getLocalDateString(new Date())}
                className="input input-bordered w-full"
                disabled={loading}
              />
            </div>

            {formData.scheduledFor && (
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Time (12-hour format)</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <select
                    value={formData.timeHours.hours}
                    onChange={(e) => handleTimeChange('hours', e.target.value)}
                    className="select select-bordered"
                    disabled={loading}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                      <option key={h} value={String(h).padStart(2, '0')}>
                        {String(h).padStart(2, '0')}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formData.timeHours.minutes}
                    onChange={(e) => handleTimeChange('minutes', e.target.value)}
                    className="select select-bordered"
                    disabled={loading}
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map(m => (
                      <option key={m} value={String(m).padStart(2, '0')}>
                        {String(m).padStart(2, '0')}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formData.timeHours.seconds}
                    onChange={(e) => handleTimeChange('seconds', e.target.value)}
                    className="select select-bordered"
                    disabled={loading}
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map(s => (
                      <option key={s} value={String(s).padStart(2, '0')}>
                        {String(s).padStart(2, '0')}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formData.timeHours.period}
                    onChange={(e) => handleTimeChange('period', e.target.value)}
                    className="select select-bordered"
                    disabled={loading}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            )}

            {formData.scheduledFor && (
              <div className="alert alert-info">
                ✅ Scheduled for <strong>{formatDateTo12Hour(formData.scheduledFor)}</strong>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="divider"></div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Interview Settings</h3>

            <div className="space-y-3">
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">📹 Video Call</span>
                  <input
                    type="checkbox"
                    checked={formData.videoEnabled}
                    onChange={() => handleToggle('videoEnabled')}
                    className="checkbox checkbox-primary"
                    disabled={loading}
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">💬 Chat Messages</span>
                  <input
                    type="checkbox"
                    checked={formData.chatEnabled}
                    onChange={() => handleToggle('chatEnabled')}
                    className="checkbox checkbox-primary"
                    disabled={loading}
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">💻 Code Editor</span>
                  <input
                    type="checkbox"
                    checked={formData.collaborativeCodeEnabled}
                    onChange={() => handleToggle('collaborativeCodeEnabled')}
                    className="checkbox checkbox-primary"
                    disabled={loading}
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">⏱️ Auto Timer</span>
                  <input
                    type="checkbox"
                    checked={formData.autoTimerEnabled}
                    onChange={() => handleToggle('autoTimerEnabled')}
                    className="checkbox checkbox-primary"
                    disabled={loading}
                  />
                </label>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t p-6 flex justify-between gap-3 sticky bottom-0 bg-base-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn btn-primary gap-2"
          >
            {loading ? 'Updating...' : '✏️ Update Interview'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditInterviewModal;
