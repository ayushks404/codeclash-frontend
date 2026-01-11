
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import { Clock, Calendar, Code, Trophy, AlertCircle, Loader, ArrowRight } from "lucide-react";

export default function ContestPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [contest, setContest] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "live" && contest && !contest.questions) {
      loadQuestions();
    }
  }, [status]);


  

  useEffect(() => {
    async function fetchstatus() {
      try {
        const res = await API.get(`/contest/${id}/status`);
        setStatus(res.data.status);
      }
      catch (err){
        console.log("status not found");
      }
    }

    async function initia() {
      await  fetchContest();
      await  fetchstatus();
    }
    initia();
    const interval = setInterval(fetchstatus , 5000);
    return () => clearInterval(interval);

  }, [id]);




  async function loadQuestions() {
    try {
      const qres = await API.get(`/contest/${id}/questions`);
      setContest(prev => ({ ...prev, questions: qres.data }));
    } catch (err) {
      console.error("Failed to load questions");
    }
  }




  async function fetchContest() {
    try {
      setLoading(true);
      const res = await API.get(`/contest/${id}`);

      const { contest, status } = res.data;

      setContest(contest);
      setStatus(status);

      if ((status === "live" || status === "ended") && contest?._id) {
        const qres = await API.get(`/contest/${id}/questions`);
        setContest(prev => ({ ...prev, questions: qres.data }));
      }
    } catch (err) {
      console.error("fetchContest error:", err);
      setError("Failed to load contest");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading contest...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!contest) return null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{contest.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(contest.startTime).toLocaleString()}</span>
                </div>
                <span>—</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(contest.endTime).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className={`px-6 py-3 rounded-xl font-semibold ${
              status === 'live' 
                ? 'bg-red-500/20 border border-red-500/30 text-red-300' 
                : status === 'upcoming'
                ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                : 'bg-slate-500/20 border border-slate-500/30 text-slate-300'
            }`}>
              {status === 'live' && <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Live Now
              </span>}
              {status === 'upcoming' && 'Upcoming'}
              {status === 'ended' && 'Ended'}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>Expected: {contest.numQuestions} problems</span>
            <span>•</span>
            <span>Loaded: {contest.questions?.length || 0} problems</span>
          </div>
        </div>

        {/* Upcoming Status */}
        {status === "upcoming" && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-8 text-center">
            <Clock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Contest Starting Soon</h3>
            <p className="text-slate-300">
              Problems will be visible once the contest goes live
            </p>
          </div>
        )}

        {/* Live + Ended */}
        {(status === "live" || status === "ended") && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Code className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Problems</h2>
            </div>

            {!contest.questions || contest.questions.length === 0 ? (
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No problems available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contest.questions.map((q, idx) => (
                  <Link
                    key={q._id}
                    to={`/contest/${id}/problem/${q._id}`}
                    className="group"
                  >
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:-translate-y-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 font-bold text-lg">#{idx + 1}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            q.difficulty === 'Easy' 
                              ? 'bg-green-500/20 text-green-300'
                              : q.difficulty === 'Medium'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">{q.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {status === "ended" && (
              <div className="mt-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
                <Trophy className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Contest Ended</h3>
                <p className="text-slate-400">
                  You can still view problems and review solutions
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}