import { Link } from "react-router";
import { ArrowRightIcon, CheckIcon, Code2Icon, UsersIcon, UsersRound, VideoIcon, ZapIcon } from "lucide-react";
import { SignInButton } from "@clerk/clerk-react";

const HomePage = () => {
  return (
    <div className="bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      <nav className="bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 hover:scale-105 transition-transform duration-200"
          >
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
              <UsersRound className="size-6 text-white" />
            </div>

            <div className="flex flex-col">
              <span className="font-black text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider">
                TalentSync
              </span>
              <span className="text-xs text-base-content/60 font-medium -mt-1">
                Hiring Made Easy
              </span>
            </div>
          </Link>

          <SignInButton mode="modal">
            <button className="group px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2">
              <span>Get Started</span>
              <ArrowRightIcon className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </SignInButton>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-10 self-start lg:-mt-13">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold w-fit">
              <ZapIcon className="size-4" />
              Live Coding Interview
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
              <span className="block text-base-content">Interview Smarter.</span>
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Code in Real Time.
              </span>
            </h1>

            <p className="text-lg text-base-content/70 max-w-xl">
              Conduct real-time coding interviews with a shared editor, live video calls,
              and instant evaluation. Assess candidates on real problem-solving skills.
            </p>

            <div className="flex flex-wrap gap-3">
              <div className="badge badge-lg badge-outline">
                <CheckIcon className="size-4 text-success" />
                Live Video
              </div>
              <div className="badge badge-lg badge-outline">
                <CheckIcon className="size-4 text-success" />
                Code Editor
              </div>
              <div className="badge badge-lg badge-outline">
                <CheckIcon className="size-4 text-success" />
                Multi Language
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <SignInButton mode="modal">
                <button className="btn btn-primary btn-lg gap-2">
                  Start Interview
                  <ArrowRightIcon className="size-5" />
                </button>
              </SignInButton>

              <button className="btn btn-outline btn-lg gap-2">
                <VideoIcon className="size-5" />
                Watch Demo
              </button>
            </div>

            <div className="stats stats-horizontal bg-base-100 shadow-lg w-full">
              <div className="stat">
                <div className="stat-value text-primary">10K+</div>
                <div className="stat-title">Active Users</div>
              </div>
              <div className="stat">
                <div className="stat-value text-secondary">50K+</div>
                <div className="stat-title">Sessions</div>
              </div>
              <div className="stat">
                <div className="stat-value text-accent">99.9%</div>
                <div className="stat-title">Uptime</div>
              </div>
            </div>
          </div>

          <div className="bg-base-100 rounded-3xl shadow-2xl border border-base-300 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-base-200 border-b border-base-300">
              <span className="font-semibold text-sm">Interview Question</span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                JavaScript
              </span>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-base-200 rounded-xl p-5 text-sm">
                <span className="text-primary font-semibold block mb-2">
                  Problem
                </span>
                Reverse a string without using built-in reverse functions.
              </div>

              <div className="bg-neutral rounded-2xl border border-neutral-content/10 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-neutral/80 border-b border-neutral-content/10">
                  <span className="text-xs text-neutral-content/70 font-medium">
                    Candidate Code
                  </span>
                  <span className="text-xs text-success font-semibold">
                    Running ✓
                  </span>
                </div>

                <pre className="p-6 text-sm sm:text-base font-mono text-success leading-relaxed overflow-x-auto">
                  {`function reverseString(str) {
  let result = "";

  for (let i = str.length - 1; i >= 0; i--) {
    result += str[i];
  }

  return result;
}`}
                </pre>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-success font-semibold">
                  ✓ Code Accepted
                </span>
                <span className="text-xs text-base-content/60">
                  Candidate Response
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    {/* FEATURES SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need to <span className="text-primary font-mono">Succeed</span>
          </h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Powerful features designed to make your coding interviews seamless and productive
          </p>
        </div>

        {/* FEATURES GRID */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <VideoIcon className="size-8 text-primary" />
              </div>
              <h3 className="card-title">HD Video Call</h3>
              <p className="text-base-content/70">
                Crystal clear video and audio for seamless communication during interviews
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Code2Icon className="size-8 text-primary" />
              </div>
              <h3 className="card-title">Live Code Editor</h3>
              <p className="text-base-content/70">
                Collaborate in real-time with syntax highlighting and multiple language support
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <UsersIcon className="size-8 text-primary" />
              </div>
              <h3 className="card-title">Easy Collaboration</h3>
              <p className="text-base-content/70">
                Share your screen, discuss solutions, and learn from each other in real-time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
