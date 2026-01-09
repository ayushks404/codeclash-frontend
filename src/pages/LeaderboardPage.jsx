

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { Trophy, Medal, Award, Loader, AlertCircle } from "lucide-react";

export default function LeaderboardPage() {
  const { id: contestId } = useParams();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!contestId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await API.get(`/contest/${contestId}/leaderboard`);
        const data = res.data?.leaderboard ?? res.data ?? [];
        setBoard(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.response?.data?.error || e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [contestId]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading leaderboard...</p>
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

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-slate-400 font-bold">#{rank}</span>;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl mb-6 shadow-lg shadow-yellow-500/50">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Leaderboard</h1>
          <p className="text-slate-400">Contest Rankings</p>
        </div>

        {/* Leaderboard */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {board.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No participants yet</p>
              <p className="text-slate-500 text-sm mt-2">Be the first to submit!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Participant</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Solved</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {board.map((row, i) => (
                    <tr 
                      key={row.userId || i} 
                      className={`border-b border-white/5 hover:bg-white/5 transition ${
                        i < 3 ? 'bg-gradient-to-r from-transparent to-yellow-500/5' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getRankIcon(i + 1)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">{row.name}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 font-semibold text-sm">
                          {row.solved}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-white font-bold text-lg">{row.score}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


