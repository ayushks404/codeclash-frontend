
// ============================================
// ProblemPage.jsx
// ============================================
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import CodeEditor from "../components/CodeEditor";
import Timer from "../components/Timer";
import { Clock, Code, Send, Brain, Trophy, Loader, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const LANGS = [
  {
    id: 54,
    name: "C++ (g++)",
    template: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`
  },
  {
    id: 71,
    name: "Python (3)",
    template: `# Write your code here`
  },
  {
    id: 63,
    name: "JavaScript (Node)",
    template: `// Write your code here`
  }
];

export default function ProblemPage() {
  const { id: contestId, pid } = useParams();
  const navigate = useNavigate();

  const [contest, setContest] = useState(null);
  const [contestStatus, setContestStatus] = useState(null);
  const [problem, setProblem] = useState(null);
  const [langId, setLangId] = useState(LANGS[0].id);
  const [code, setCode] = useState(LANGS[0].template);
  const [submitting, setSubmitting] = useState(false);
  const [submissionInfo, setSubmissionInfo] = useState(null);
  const [error, setError] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewText, setReviewText] = useState("");

  const isSubmissionDisabled = contestStatus !== "live" || submitting;

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const fetchContest = async () => {
      try {
        const res = await API.get(`/contest/${contestId}`);
        if (!isMounted) return;
        setContest(res.data.contest);
        setContestStatus(res.data.status);
        setError(null);
        if (res.data.status === "ended" && intervalId) {
          clearInterval(intervalId);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("fetchContest error:", err);
        setError("Failed to load contest");
      }
    };

    fetchContest();
    intervalId = setInterval(fetchContest, 5000);
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [contestId]);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await API.get(`/questions/${pid}`);
        setProblem(res.data);
        setError(null);
      } catch (err) {
        console.error("fetchProblem error:", err);
        setError("Failed to load problem");
      }
    };
    if (pid) fetchProblem();
  }, [pid]);

  useEffect(() => {
    const lang = LANGS.find(l => l.id === Number(langId));
    if (lang) setCode(lang.template);
    setSubmissionInfo(null);
  }, [langId, pid]);

  async function submit() {
    if (isSubmissionDisabled) return;
    setSubmitting(true);
    setSubmissionInfo(null);

    try {
      const res = await API.post("/submissions", {
        language_id: Number(langId),
        source_code: code,
        contestId,
        questionId: pid
      });
      const submissionId = res.data.submissionId;
      setSubmissionInfo({ verdict: "Judging...", isAccepted: false });
      pollSubmission(submissionId);
    } catch (err) {
      setSubmissionInfo({
        verdict: err?.response?.data?.error || "Submission failed",
        isAccepted: false
      });
      setSubmitting(false);
    }
  }

  async function pollSubmission(id, attempts = 0) {
    if (attempts > 30) {
      setSubmissionInfo({ verdict: "Timed out", isAccepted: false });
      setSubmitting(false);
      return;
    }
    try {
      const res = await API.get(`/submissions/${id}`);
      const verdict = res.data.verdict;
      if (verdict === "Pending" || verdict === "Judging") {
        setTimeout(() => pollSubmission(id, attempts + 1), 2000);
      } else {
        setSubmissionInfo({
          verdict,
          isAccepted: /accepted/i.test(verdict)
        });
        setSubmitting(false);
      }
    } catch {
      setSubmissionInfo({ verdict: "Error fetching result", isAccepted: false });
      setSubmitting(false);
    }
  }


  
  async function runCodeReview() {
    if (!code) return;
    setReviewLoading(true);
    setReviewText("");
    try {
      const res = await API.post("/ai/code-review", {
        code,
        language: LANGS.find(l => l.id === langId)?.name,
        problem: problem?.description || ""
      });
      setReviewText(res.data.review);
    } catch (err) {
      setReviewText("Failed to generate code review.");
    } finally {
      setReviewLoading(false);
    }
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

  if (!contest || !problem) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading problem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-[2000px] mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Section */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 lg:p-8 overflow-auto max-h-[calc(100vh-2rem)]">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6">{problem.title}</h2>
            <div 
              className="prose prose-invert prose-sm max-w-none text-slate-300"
              dangerouslySetInnerHTML={{ __html: problem.description }} 
            />
          </div>

          {/* Editor Section */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 lg:p-8">
            {/* Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-xl font-semibold text-sm ${
                  contestStatus === "live" 
                    ? "bg-red-500/20 border border-red-500/30 text-red-300" 
                    : contestStatus === "upcoming"
                    ? "bg-yellow-500/20 border border-yellow-500/30 text-yellow-300"
                    : "bg-slate-500/20 border border-slate-500/30 text-slate-300"
                }`}>
                  {contestStatus === 'live' && <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Live
                  </span>}
                  {contestStatus === 'upcoming' && 'Upcoming'}
                  {contestStatus === 'ended' && 'Ended'}
                </span>
              </div>
              <Timer endTime={contest.endTime} />
            </div>

            {/* Status Messages */}
            {contestStatus === "upcoming" && (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-300 text-sm">
                Contest has not started. Submission is disabled.
              </div>
            )}

            {contestStatus === "ended" && (
              <div className="mb-6 p-4 bg-slate-500/10 border border-slate-500/30 rounded-xl text-slate-300 text-sm">
                Contest has ended. Submission is disabled.
              </div>
            )}

            {/* Language Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Code className="w-4 h-4 inline mr-2" />
                Programming Language
              </label>
              <select
                value={langId}
                onChange={e => setLangId(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LANGS.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            {/* Code Editor */}
            <div className="mb-6">
              <CodeEditor code={code} setCode={setCode} />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={submit}
                disabled={isSubmissionDisabled}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
                  isSubmissionDisabled
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/30"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Solution
                  </>
                )}
              </button>

              {contestStatus === "ended" && (
                <>
                  <button
                    onClick={() => {
                      setShowReview(true);
                      runCodeReview();
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
                  >
                    <Brain className="w-5 h-5" />
                    AI Review
                  </button>

                  <button
                    onClick={() => navigate(`/contest/${contestId}/leaderboard`)}
                    className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition"
                  >
                    <Trophy className="w-5 h-5" />
                    Leaderboard
                  </button>
                </>
              )}
            </div>

            {/* Submission Result */}
            {submissionInfo && (
              <div className={`p-4 rounded-xl border ${
                submissionInfo.isAccepted 
                  ? "bg-green-500/10 border-green-500/30" 
                  : "bg-red-500/10 border-red-500/30"
              }`}>
                <div className="flex items-center gap-3">
                  {submissionInfo.isAccepted ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                  <div>
                    <span className="font-semibold text-white">Result:</span>{" "}
                    <span className={submissionInfo.isAccepted ? "text-green-300" : "text-red-300"}>
                      {submissionInfo.verdict}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Code Review Sidebar */}
      {showReview && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={() => setShowReview(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full sm:w-2/5 lg:w-1/3 bg-gradient-to-br from-slate-900 to-slate-800 border-l border-white/10 p-6 overflow-y-auto z-50 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">AI Code Review</h3>
              </div>
              <button
                onClick={() => setShowReview(false)}
                className="text-slate-400 hover:text-white text-2xl transition"
              >
                ✕
              </button>
            </div>

            {reviewLoading && (
              <div className="flex items-center gap-3 text-slate-300">
                <Loader className="w-5 h-5 animate-spin text-purple-400" />
                <span>Analyzing your code...</span>
              </div>
            )}

            {!reviewLoading && reviewText && (
              <div className="bg-slate-950/50 border border-white/10 rounded-xl p-4">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300 font-mono">
                  {reviewText}
                </pre>
              </div>
            )}

            {!reviewLoading && !reviewText && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No review generated yet</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
