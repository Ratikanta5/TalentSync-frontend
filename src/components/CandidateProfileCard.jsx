import {
  Edit,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Award,
  Code,
  ExternalLink,
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

function CandidateProfileCard({ candidate, onEditProfile }) {
  const { user } = useUser();

  return (
    <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content border-2 border-primary/40 h-full">
      <div className="card-body">
        {/* Header with Edit Button */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-bold">Your Profile</h2>
          <button
            onClick={onEditProfile}
            className="btn btn-sm btn-ghost btn-circle text-primary-content hover:bg-white/20"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar Section */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user?.firstName}
                className="w-20 h-20 rounded-full border-4 border-white/30 object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-3xl font-bold">
                  {user?.firstName?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <h3 className="text-xl font-bold mb-1">
            {user?.firstName} {user?.lastName}
          </h3>
          <p className="text-sm opacity-90 mb-4">{candidate?.bio || 'Full Stack Developer'}</p>

          {/* Badge */}
          <div className="badge badge-lg gap-2 bg-white/20 border-0 text-primary-content">
            <Award className="w-4 h-4" />
            Candidate
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3 mb-6 pb-6 border-b border-white/20">
          {/* Email */}
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 opacity-70" />
            <span className="text-sm truncate">{user?.emailAddresses[0]?.emailAddress}</span>
          </div>

          {/* Location */}
          {candidate?.location && (
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 opacity-70" />
              <span className="text-sm">{candidate.location}</span>
            </div>
          )}

          {/* Skills */}
          {candidate?.skills && candidate.skills.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase opacity-70 mb-2">
                Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="badge badge-sm bg-white/20 border-0">
                    {skill}
                  </span>
                ))}
                {candidate.skills.length > 3 && (
                  <span className="badge badge-sm bg-white/20 border-0">
                    +{candidate.skills.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-80">Interview Score</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-white/20 rounded-full h-2">
                <div className="bg-white rounded-full h-2 w-3/4"></div>
              </div>
              <span className="text-sm font-bold">75%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm opacity-80">Completion Rate</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-white/20 rounded-full h-2">
                <div className="bg-white rounded-full h-2 w-2/3"></div>
              </div>
              <span className="text-sm font-bold">67%</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onEditProfile}
            className="btn btn-sm w-full btn-outline text-primary-content border-primary-content hover:bg-white/20 hover:border-white"
            gap="2"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>

          <button className="btn btn-sm btn-ghost w-full text-primary-content hover:bg-white/20">
            <Code className="w-4 h-4" />
            Portfolio
          </button>

          <div className="flex gap-2 pt-2">
            <a
              href="#"
              className="btn btn-sm btn-ghost flex-1 text-primary-content hover:bg-white/20"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="btn btn-sm btn-ghost flex-1 text-primary-content hover:bg-white/20"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="btn btn-sm btn-ghost flex-1 text-primary-content hover:bg-white/20"
              title="Portfolio"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-xs text-center opacity-70 italic pt-4 border-t border-white/20">
          Keep your profile updated to improve your chances
        </div>
      </div>
    </div>
  );
}

export default CandidateProfileCard;
