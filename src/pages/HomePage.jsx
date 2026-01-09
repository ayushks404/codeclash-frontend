
// src/pages/HomePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, Plus, Trophy, Zap, Code, Users, ArrowRight, Sparkles, Target, Brain, GitBranch, Award, TrendingUp } from 'lucide-react';

function splitByStatus(contests) {
  const now = Date.now();
  const live = [];
  const upcoming = [];
  for (const c of (contests || [])) {
    const s = new Date(c.startTime).getTime();
    const e = new Date(c.endTime).getTime();
    if (now >= s && now <= e) live.push(c);
    else if (now < s) upcoming.push(c);
  }
  return { live, upcoming };
}

export default function HomePage() {
  const [contests, setContests] = useState([]);
  const [form, setForm] = useState({ name: '', startTime: '', endTime: '', numQuestions: 5 });
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    fetchContests();
    const int = setInterval(fetchContests, 30000);
    return () => clearInterval(int);
  }, []);

  async function fetchContests() {
    try {
      const r = await API.get('/contest');
      setContests(r.data || []);
    } catch (err) {
      console.error("fetchContests:", err);
      setMessage('Failed to load contests');
      setMessageType('error');
    }
  }

  const groups = useMemo(() => splitByStatus(contests), [contests]);

  async function createContest(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await API.post('/contest', {
        name: form.name,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        numQuestions: Number(form.numQuestions || 5)
      });

      setContests(prev => [res.data, ...prev]);
      setMessage('Contest created successfully!');
      setMessageType('success');
      setForm({ name: '', startTime: '', endTime: '', numQuestions: 5 });
      setShowCreateForm(false);
      window.dispatchEvent(new Event('contestCreatedResetEditor'));
    } catch (err) {
      console.error("createContest:", err);
      setMessage(err?.response?.data?.error || err?.response?.data?.message || err.message || 'Failed to create contest.');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  }

  async function join(id) {
    try {
      await API.post(`/contest/${id}/join`);
      nav(`/contest/${id}`);
    } catch (err) {
      console.error("join:", err);
      setMessage(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to join contest."
      );
      setMessageType("error");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full mb-8 backdrop-blur-sm">
              <Brain className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-sm text-blue-300 font-medium">AI-Powered Code Reviews</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Host Custom</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Competitive Programming
              </span>
              <br />
              <span className="text-white">Contests</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Create coding challenges, compete in real-time, and get AI-powered feedback on your solutions. 
              Perfect for teams, universities, and coding communities.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-white shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Contest
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
                className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl font-semibold text-white hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                Browse Contests
              </button>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Real-Time Judging</h3>
                <p className="text-slate-400 text-sm">Instant feedback with automated test cases and verdict system</p>
              </div>

              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">AI Code Review</h3>
                <p className="text-slate-400 text-sm">Get intelligent insights and suggestions after the contest</p>
              </div>

              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Live Leaderboard</h3>
                <p className="text-slate-400 text-sm">Track rankings and compete with other programmers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className={`p-4 rounded-xl backdrop-blur-sm border ${
            messageType === 'error' 
              ? 'bg-red-500/10 border-red-500/30 text-red-300' 
              : 'bg-green-500/10 border-green-500/30 text-green-300'
          } flex items-center gap-3`}>
            <div className="flex-1">{message}</div>
            <button onClick={() => setMessage(null)} className="text-current hover:opacity-70">×</button>
          </div>
        </div>
      )}

      {/* Create Contest Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative animate-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => setShowCreateForm(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white">Create Contest</h3>
            </div>
            
            <form onSubmit={createContest} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Contest Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Weekly Coding Challenge #42"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.startTime}
                    onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.endTime}
                    onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Number of Questions</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={form.numQuestions}
                  onChange={e => setForm(f => ({ ...f, numQuestions: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                  submitting
                    ? 'bg-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]'
                }`}
              >
                {submitting ? 'Creating Contest...' : 'Create Contest'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dashboard Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-950/40 to-red-900/20 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 hover:border-red-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-red-300 text-sm font-medium uppercase tracking-wider">Live Now</h3>
              <Zap className="w-6 h-6 text-red-400" />
            </div>
            <div className="text-5xl font-bold text-white mb-2">{groups.live.length}</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-300 text-sm">Active contests</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-950/40 to-blue-900/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-blue-300 text-sm font-medium uppercase tracking-wider">Upcoming</h3>
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-5xl font-bold text-white mb-2">{groups.upcoming.length}</div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm">Scheduled</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-950/40 to-purple-900/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-300 text-sm font-medium uppercase tracking-wider">Total</h3>
              <Trophy className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-5xl font-bold text-white mb-2">{contests.length}</div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm">All contests</span>
            </div>
          </div>
        </div>

        {/* Live Contests */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="p-6 sm:p-8 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Live Contests</h3>
                  <p className="text-slate-400 text-sm">Join and start competing now</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-sm font-medium">{groups.live.length} Active</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {groups.live.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-10 h-10 text-slate-600" />
                </div>
                <p className="text-slate-400 text-lg mb-2">No live contests</p>
                <p className="text-slate-500 text-sm">Check back soon or create your own contest</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.live.map(c => (
                  <div
                    key={c._id}
                    className="group relative bg-gradient-to-br from-red-950/30 to-transparent border border-red-500/30 rounded-2xl p-6 hover:border-red-500/60 transition-all hover:-translate-y-1 cursor-pointer overflow-hidden"
                    onClick={() => join(c._id)}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Live</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-red-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-3 line-clamp-2">{c.name}</h4>
                      <div className="space-y-2 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{new Date(c.startTime).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Ends: {new Date(c.endTime).toLocaleString()}</span>
                        </div>
                      </div>
                      <button className="w-full mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors">
                        Join Contest
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Contests */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Upcoming Contests</h3>
                  <p className="text-slate-400 text-sm">Register early to secure your spot</p>
                </div>
              </div>
              <span className="text-slate-400 text-sm font-medium">{groups.upcoming.length} Scheduled</span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {groups.upcoming.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-slate-600" />
                </div>
                <p className="text-slate-400 text-lg mb-2">No upcoming contests</p>
                <p className="text-slate-500 text-sm">Be the first to create one</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.upcoming.map(c => (
                  <div
                    key={c._id}
                    className="group relative bg-slate-950/30 border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:-translate-y-1 cursor-pointer overflow-hidden"
                    onClick={() => join(c._id)}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">Upcoming</span>
                        <ArrowRight className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-3 line-clamp-2">{c.name}</h4>
                      <div className="space-y-2 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Starts: {new Date(c.startTime).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Ends: {new Date(c.endTime).toLocaleString()}</span>
                        </div>
                      </div>
                      <button className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors">
                        Register Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}