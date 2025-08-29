
// frontend/src/pages/ContestPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function ContestPage(){
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [contestObj, setContestObj] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContest();
    const int = setInterval(fetchContest, 5000);
    return () => clearInterval(int);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchContest(){
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/contest/${id}`);
      const data = res?.data ?? null;

      if (!data) {
        setError('Empty response from server');
        setContestObj(null);
        setStatus(null);
        return;
      }

      if (data.status && data.contest) {
        setContestObj(data.contest);
        setStatus(data.status);

        if (data.status === "live" && (!data.contest.questions || data.contest.questions.length === 0)) {
          try {
            const qres = await API.get(`/contest/${id}/questions`);
            setContestObj(prev => ({ ...prev, questions: qres.data }));
          } catch (qErr) {
            console.error('Error fetching questions:', qErr);
          }
        }
      } else {
        setContestObj(data);
        const serverTime = data.serverTime ? Number(data.serverTime) : Date.now();
        const s = data.startTime ? new Date(data.startTime).getTime() : null;
        const e = data.endTime ? new Date(data.endTime).getTime() : null;

        let computedStatus = null;
        if (s && e) {
          if (serverTime < s) computedStatus = 'upcoming';
          else if (serverTime >= s && serverTime <= e) computedStatus = 'live';
          else computedStatus = 'ended';
        }
        setStatus(computedStatus);

        if (computedStatus === "live" && (!data.questions || data.questions.length === 0)) {
          try {
            const qres = await API.get(`/contest/${id}/questions`);
            setContestObj(prev => ({ ...prev, questions: qres.data }));
          } catch (qErr) {
            console.error('Error fetching questions (fallback):', qErr);
          }
        }
      }
    } catch (err) {
      console.error('fetchContest error:', err);
      const code = err?.response?.status;
      if (code === 401) {
        setError('Unauthorized — please log in');
        setTimeout(() => navigate('/login'), 800);
      } else if (code === 403) {
        setError('Forbidden — you may not have access to this contest');
      } else if (code === 404) {
        setError('Contest not found (404)');
      } else {
        setError(err?.response?.data?.error || err.message || 'Failed to load contest');
      }
      setContestObj(null);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  // Redirect user if contest ended (keeps brief display)
  useEffect(() => {
    if (status === 'ended') {
      setTimeout(() => {
        if (window.history.length > 1) navigate(-1);
        else navigate('/home');
      }, 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (loading) return <div>Loading contest...</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;
  if (!contestObj && !status) return <div>No contest data available.</div>;

  return (
    <div>
      <h2>{contestObj?.name ?? 'Contest'}</h2>
      <div>
        <strong>Status:</strong> {status ?? 'Unknown'}
      </div>
      {contestObj && (
        <>
          <div>{new Date(contestObj.startTime).toLocaleString()} — {new Date(contestObj.endTime).toLocaleString()}</div>

          <div style={{fontSize: 12, color: '#666', margin: '8px 0'}}>
            Expected questions: {contestObj.numQuestions || 'Unknown'} |
            Loaded questions: {contestObj.questions?.length || 0}
          </div>

          <h3>Problems</h3>
          {(!contestObj.questions || contestObj.questions.length === 0) ? (
            <div>No problems assigned yet.</div>
          ) : (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
              {contestObj.questions.map(q => (
                <Link key={q._id} to={`/contest/${id}/problem/${q._id}`}>
                  <div className="card" style={{padding: 12, borderRadius: 8, border: '1px solid #eee'}}>
                    <div style={{fontWeight:700}}>{q.title}</div>
                    <div style={{fontSize:12}}>{q.difficulty}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
