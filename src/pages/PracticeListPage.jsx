import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Search, Filter, ChevronRight, Zap, Trophy, Clock, Code2, ChevronUp, ChevronDown } from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router';
import Navbar from '../components/Navbar';

function PracticeListPage() {
  const { user } = useUser();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Dynamic filters from actual interview data
  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);

  // Load available filters from actual interview problems
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setFiltersLoading(true);
        const response = await axios.get('/practice/filters');
        if (response.data.success) {
          setCompanies(response.data.data.companies);
          setRoles(response.data.data.roles);
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
        toast.error('Failed to load filter options');
      } finally {
        setFiltersLoading(false);
      }
    };

    fetchFilters();
  }, []);

  // Fetch problems with filters
  useEffect(() => {
    fetchProblems();
  }, [search, difficulty, company, role, sortBy, page]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params = {
        sortBy,
        page,
        limit: 20,
        ...(search && { search }),
        ...(difficulty && { difficulty }),
        ...(company && { company }),
        ...(role && { role })
      };

      const response = await axios.get('/practice', { params });

      if (response.data.success) {
        setProblems(response.data.data);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setDifficulty('');
    setCompany('');
    setRole('');
    setSortBy('newest');
    setPage(1);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'badge-success';
      case 'medium':
        return 'badge-warning';
      case 'hard':
        return 'badge-error';
      default:
        return 'badge-primary';
    }
  };

  const getStatusBadge = (problem) => {
    if (problem.solved) {
      return <span className="badge badge-success gap-1"><Trophy className="w-3 h-3" />Solved</span>;
    }
    if (problem.attempted) {
      return <span className="badge badge-warning gap-1"><Clock className="w-3 h-3" />Attempted</span>;
    }
    return null;
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-base-300 via-base-200 to-base-300">
        <Navbar />

        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Practice Problems</h1>
              <p className="text-base-content/60">
                Master coding by solving problems. Filtered by company and role.
              </p>
            </div>

            {/* Filters Section */}
            <div className="bg-base-100 rounded-2xl p-6 border-2 border-primary/20 mb-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                {/* Search */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Search</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Problem title..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="input input-bordered focus:input-primary"
                  />
                </div>

                {/* Difficulty */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Difficulty</span>
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => {
                      setDifficulty(e.target.value);
                      setPage(1);
                    }}
                    className="select select-bordered focus:select-primary"
                  >
                    <option value="">All Levels</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Company - Dynamic from actual interview data */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Company</span>
                  </label>
                  <select
                    value={company}
                    onChange={(e) => {
                      setCompany(e.target.value);
                      setPage(1);
                    }}
                    className="select select-bordered focus:select-primary"
                    disabled={filtersLoading}
                  >
                    <option value="">All Companies</option>
                    {companies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role - Dynamic from actual interview data */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Role</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      setPage(1);
                    }}
                    className="select select-bordered focus:select-primary"
                    disabled={filtersLoading}
                  >
                    <option value="">All Roles</option>
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort - Date/Time Wise (Newest/Oldest) */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Sort By</span>
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="select select-bordered focus:select-primary"
                  >
                    <option value="newest">
                      <ChevronDown className="inline w-3 h-3 mr-1" />
                      Newest First
                    </option>
                    <option value="oldest">
                      <ChevronUp className="inline w-3 h-3 mr-1" />
                      Oldest First
                    </option>
                  </select>
                </div>
              </div>

              {/* Reset Button */}
              <div className="flex justify-end">
                <button
                  onClick={resetFilters}
                  className="btn btn-sm btn-outline gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Problems List */}
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : problems.length > 0 ? (
              <>
                <div className="space-y-4">
                  {problems.map((problem) => (
                    <Link
                      key={problem._id}
                      to={`/practice/${problem._id}`}
                      className="group card bg-base-100 border-2 border-base-300 hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="card-body p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="card-title text-lg group-hover:text-primary transition-colors mb-2">
                              {problem.title}
                            </h3>

                            {/* Details Row */}
                            <div className="flex flex-wrap gap-3 items-center mb-3">
                              {/* Difficulty */}
                              <span
                                className={`badge badge-lg ${getDifficultyColor(
                                  problem.difficulty
                                )}`}
                              >
                                {problem.difficulty.charAt(0).toUpperCase() +
                                  problem.difficulty.slice(1)}
                              </span>

                              {/* Category */}
                              <span className="badge badge-outline">
                                {problem.category}
                              </span>

                              {/* Status */}
                              {getStatusBadge(problem)}

                              {/* Companies */}
                              {problem.companies.length > 0 && (
                                <span className="text-xs text-base-content/60">
                                  <strong>Companies:</strong>{' '}
                                  {problem.companies.join(', ')}
                                </span>
                              )}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6 text-sm text-base-content/70">
                              <span className="flex items-center gap-1">
                                <Zap className="w-4 h-4" />
                                {problem.stats.acceptanceRate}% Acceptance
                              </span>
                              <span className="flex items-center gap-1">
                                <Code2 className="w-4 h-4" />
                                {problem.stats.totalAttempts} Attempts
                              </span>
                            </div>
                          </div>

                          {/* Arrow Icon */}
                          <ChevronRight className="w-6 h-6 text-base-content/40 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="btn btn-sm"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`btn btn-sm ${
                            page === p ? 'btn-primary' : 'btn-outline'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="btn btn-sm"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="card bg-base-100 border-2 border-dashed border-primary/30">
                <div className="card-body text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                    <Search className="w-12 h-12 text-primary/50" />
                  </div>
                  <h3 className="card-title justify-center mb-2">
                    No Problems Found
                  </h3>
                  <p className="text-base-content/60">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default PracticeListPage;
