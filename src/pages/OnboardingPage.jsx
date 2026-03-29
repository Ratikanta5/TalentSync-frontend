import { useNavigate } from 'react-router';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Code2Icon, UsersRound, BriefcaseIcon, ArrowRightIcon, CheckIcon } from 'lucide-react';
import { useState } from 'react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const roles = [
    {
      id: 'candidate',
      title: 'Candidate',
      description: 'Practice coding interviews and solve problems',
      icon: Code2Icon,
      color: 'from-blue-500 to-cyan-500',
      features: ['Solve coding problems', 'Practice interviews', 'Get feedback', 'Build portfolio']
    },
    {
      id: 'interviewer',
      title: 'Interviewer',
      description: 'Conduct interviews and evaluate candidates',
      icon: UsersRound,
      color: 'from-purple-500 to-pink-500',
      features: ['Conduct interviews', 'Evaluate candidates', 'Manage problems', 'Track sessions']
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'Manage platform and users',
      icon: BriefcaseIcon,
      color: 'from-amber-500 to-orange-500',
      features: ['Manage users', 'Configure problems', 'View analytics', 'System settings']
    }
  ];

  const handleRoleSelection = async (roleId) => {
    console.log('🎯 Starting role selection for:', roleId);
    console.log('👤 User data:', { id: user?.id, name: user?.fullName, email: user?.primaryEmailAddress?.emailAddress });
    
    // Admin role requires special handling - skip for regular users
    if (roleId === 'admin') {
      console.log('❌ Admin role selected - not allowed');
      toast.error('Admin role requires special access. Contact support.');
      return;
    }

    // Interviewer requires company name
    if (roleId === 'interviewer' && !companyName.trim()) {
      console.log('❌ Interviewer selected but no company name');
      toast.error('Please enter your company name');
      return;
    }

    setSelectedRole(roleId);
    setLoading(true);

    try {
      const payload = {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        role: roleId,
        companyName: roleId === 'interviewer' ? companyName : undefined,
        avatar: user.imageUrl
      };
      
      console.log('📤 Sending payload to /users/onboard:', payload);
      console.log('📡 API Base URL:', axios.defaults.baseURL);
      
      // Update user role in database
      const response = await axios.post('/users/onboard', payload);
      
      console.log('✅ Full response object:', response);
      console.log('✅ Response status:', response.status);
      console.log('✅ Backend response data:', response.data);

      if (response.data.success) {
        toast.success(`Welcome, ${roleId}!`);
        console.log('🎉 Onboarding successful! Redirecting to dashboard...');
        console.log('👤 User role:', roleId);
        
        // Redirect to dashboard - it will show different content based on user role
        navigate('/dashboard');
      } else {
        console.log('❌ Response success is false:', response.data);
        const errorMsg = response.data.message || response.data.error || 'Failed to complete onboarding';
        console.log('❌ Error message:', errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Onboarding error:', error);
      console.error('❌ Error type:', error.constructor.name);
      console.error('❌ Error message:', error.message);
      
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
        console.error('❌ Response headers:', error.response.headers);
        toast.error(error.response.data?.message || error.response.data?.error || 'Failed to complete onboarding');
      } else if (error.request) {
        console.error('❌ Request made but no response:', error.request);
        toast.error('No response from server. Check if backend is running on http://localhost:3000');
      } else {
        console.error('❌ Error setting up request:', error.message);
        toast.error(`Error: ${error.message}`);
      }
      
      setSelectedRole(null);
    } finally {
      setLoading(false);
    }
  };

  const RoleCard = ({ role }) => {
    const Icon = role.icon;
    const isSelected = selectedRole === role.id;

    return (
      <div
        onClick={() => !loading && role.id !== 'admin' && setSelectedRole(role.id)}
        className={`relative p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 group ${
          isSelected
            ? 'border-primary bg-primary/5 shadow-2xl scale-105'
            : 'border-base-300 hover:border-primary/50 hover:bg-base-100/50 hover:shadow-xl'
        } ${role.id === 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {/* Background gradient */}
        <div
          className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 bg-gradient-to-br ${role.color} transition-opacity`}
        ></div>

        <div className="relative z-10">
          {/* Icon */}
          <div
            className={`w-16 h-16 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-6 text-white shadow-lg group-hover:shadow-xl transition-shadow`}
          >
            <Icon className="w-8 h-8" />
          </div>

          {/* Title and Description */}
          <h3 className="text-xl font-bold mb-2">{role.title}</h3>
          <p className="text-sm text-base-content/70 mb-6">{role.description}</p>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {role.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckIcon className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-base-content/80">{feature}</span>
              </div>
            ))}
          </div>

          {/* Admin badge */}
          {role.id === 'admin' && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-semibold">
              <span>Coming Soon</span>
            </div>
          )}

          {/* Selection indicator */}
          {isSelected && (
            <div className="absolute top-4 right-4">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <CheckIcon className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold">
            <UsersRound className="w-5 h-5" />
            Welcome to TalentSync
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">
            Choose Your Role
          </h1>

          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Select how you'd like to use TalentSync. You can always change this later in your settings.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {roles.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>

        {/* Company Name Input for Interviewer */}
        {selectedRole === 'interviewer' && (
          <div className="max-w-md mx-auto mb-8 p-6 rounded-xl bg-base-100 border border-primary/30">
            <label className="block text-sm font-semibold mb-2">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter your company name"
              className="w-full px-4 py-3 rounded-lg border border-base-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="max-w-md mx-auto flex gap-4">
          {selectedRole ? (
            <>
              <button
                onClick={() => setSelectedRole(null)}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-base-300 hover:border-base-400 font-semibold transition-all"
              >
                Back
              </button>
              <button
                onClick={() => handleRoleSelection(selectedRole)}
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => signOut()}
              className="w-full px-6 py-3 rounded-lg border-2 border-base-300 hover:border-base-400 font-semibold transition-all"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Info text */}
        <p className="text-center text-sm text-base-content/60 mt-8">
          Select a role above to get started
        </p>
      </div>
    </div>
  );
};

export default OnboardingPage;
