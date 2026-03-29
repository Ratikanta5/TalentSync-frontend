import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Plus, Settings, Calendar, Users, FileText, Clock } from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import CreateInterviewModal from '../components/CreateInterviewModal';
import UpcomingInterviewsList from '../components/UpcomingInterviewsList';
import InterviewDetailsModal from '../components/InterviewDetailsModal';

function InterviewerDashboard() {
  const { user } = useUser();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, scheduled, active, completed

  // Fetch interviews on mount
  useEffect(() => {
    fetchInterviews();
  }, [filter]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const statusParam = filter === 'all' ? '' : filter;
      const response = await axios.get('/interviews', {
        params: { status: statusParam }
      });
      
      if (response.data.success) {
        setInterviews(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInterview = async (formData) => {
    try {
      // Clean up formData - remove timeHours and ensure scheduledFor is ISO string
      const payload = {
        title: formData.title,
        description: formData.description,
        timeLimit: formData.timeLimit,
        videoEnabled: formData.videoEnabled,
        chatEnabled: formData.chatEnabled,
        collaborativeCodeEnabled: formData.collaborativeCodeEnabled,
        autoTimerEnabled: formData.autoTimerEnabled,
        scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor).toISOString() : null
      };

      const response = await axios.post('/interviews', payload);
      
      if (response.data.success) {
        toast.success('Interview created successfully!');
        setShowCreateModal(false);
        fetchInterviews();
      }
    } catch (error) {
      console.error('Error creating interview:', error);
      toast.error(error.response?.data?.message || 'Failed to create interview');
    }
  };

  const handleViewDetails = (interview) => {
    setSelectedInterview(interview);
    setShowDetailsModal(true);
  };

  const stats = {
    total: interviews.length,
    scheduled: interviews.filter(i => i.status === 'scheduled').length,
    active: interviews.filter(i => i.status === 'active').length,
    completed: interviews.filter(i => i.status === 'completed').length
  };

  return (
    <>
      <div className="min-h-screen bg-base-300 flex flex-col">
        <Navbar />
        
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Interviewer Dashboard</h1>
              <p className="text-base-content/60">Manage and conduct interviews with candidates</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Interview
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-base-100 rounded-lg p-6 shadow-md border-l-4 border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60 mb-1">Total Interviews</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-primary opacity-20" />
              </div>
            </div>

            <div className="bg-base-100 rounded-lg p-6 shadow-md border-l-4 border-info">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60 mb-1">Scheduled</p>
                  <p className="text-3xl font-bold">{stats.scheduled}</p>
                </div>
                <Calendar className="w-8 h-8 text-info opacity-20" />
              </div>
            </div>

            <div className="bg-base-100 rounded-lg p-6 shadow-md border-l-4 border-warning">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60 mb-1">Active</p>
                  <p className="text-3xl font-bold">{stats.active}</p>
                </div>
                <Clock className="w-8 h-8 text-warning opacity-20" />
              </div>
            </div>

            <div className="bg-base-100 rounded-lg p-6 shadow-md border-l-4 border-success">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60 mb-1">Completed</p>
                  <p className="text-3xl font-bold">{stats.completed}</p>
                </div>
                <Users className="w-8 h-8 text-success opacity-20" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="tabs mb-8 bg-base-100 rounded-lg p-4 shadow-md">
            {['all', 'scheduled', 'active', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`tab tab-lg capitalize ${
                  filter === tab ? 'tab-active' : ''
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Upcoming Interviews Section */}
          <div className="bg-base-100 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Upcoming Interviews
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : interviews.length > 0 ? (
              <UpcomingInterviewsList 
                interviews={interviews}
                onViewDetails={handleViewDetails}
              />
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-base-content/60 text-lg">No interviews found</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary mt-4"
                >
                  Create Your First Interview
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Modals */}
      <CreateInterviewModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateInterview}
      />

      {selectedInterview && (
        <InterviewDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedInterview(null);
          }}
          interview={selectedInterview}
          onRefresh={fetchInterviews}
        />
      )}
    </>
  );
}

export default InterviewerDashboard;
