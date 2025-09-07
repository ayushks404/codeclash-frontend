// frontend/src/pages/ProblemPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import API from '../services/api';
import { useParams, useNavigate } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import Timer from "../components/Timer"; // Import the new Timer component

const LANGS = [
  { 
    id: 54, 
    name: 'C++ (g++)', 
    template: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    cout << "Hello World" << endl;
    return 0;
}`
  },
  { 
    id: 71, 
    name: 'Python (3)', 
    template: `# Write your code here
print("Hello World")`
  },
  { 
    id: 63, 
    name: 'JavaScript (node)', 
    template: `// Write your code here
console.log("Hello World");`
  }
];

export default function ProblemPage(){
  const { id: contestId, pid } = useParams();
  const navigate = useNavigate();

  const [contest, setContest] = useState(null);
  const [contestExpired, setContestExpired] = useState(false);

  const [prob, setProb] = useState(null);
  const [langId, setLangId] = useState(LANGS[0].id);
  const [code, setCode] = useState(LANGS[0].template);
  const [submitting, setSubmitting] = useState(false);
  const [submissionInfo, setSubmissionInfo] = useState(null);

  const redirectedRef = useRef(false);

  useEffect(() => { fetchProb(); }, [pid]);

  useEffect(() => {
    fetchContest();
    const interval = setInterval(fetchContest, 5000);
    return () => clearInterval(interval);
  }, [contestId]);

  async function fetchContest(){
    try {
      const res = await API.get(`/contest/${contestId}`);
      const data = res.data.contest || res.data;
      setContest(data);

      const now = Date.now();
      const endTime = new Date(data.endTime).getTime();

      if (now > endTime && !redirectedRef.current) {
        redirectedRef.current = true;
        setContestExpired(true);
        alert("Contest is over. Redirecting to leaderboard...");
        navigate(`/contest/${data._id}/leaderboard`);
      }
    } catch(err) {
      console.error("fetchContest error:", err);
    }
  }

  useEffect(() => {
    const found = LANGS.find(l => l.id === Number(langId));
    if (found) setCode(found.template);
    setSubmissionInfo(null);
  }, [contestId, pid, langId]);

  async function fetchProb(){
    try {
      const res = await API.get(`/questions/${pid}`);
      setProb(res.data);
      const found = LANGS.find(l => l.id === Number(langId));
      if (found) setCode(found.template);
    } catch(e){
      console.error('fetchProb error:', e);
    }
  }

  async function submit() {
    if (submitting || contestExpired) {
      alert("Submissions are disabled.");
      return;
    }
    setSubmitting(true);
    setSubmissionInfo(null);
    
    try {
      const payload = {
        language_id: Number(langId),
        source_code: code,
        questionId: pid,
        contestId: contestId
      };

      const res = await API.post('/submissions', payload);
      const submissionId = res.data.submissionId;

      if (!submissionId) {
        alert('Failed to initiate submission on the server.');
        setSubmitting(false);
        return;
      }

      setSubmissionInfo({ verdict: 'Judging...', isAccepted: false });

      const pollSubmission = async (attempts = 0) => {
        if (attempts > 30) {
          setSubmissionInfo({ verdict: 'Polling timed out.', isAccepted: false });
          setSubmitting(false);
          return;
        }

        try {
          const r = await API.get(`/submissions/${submissionId}`);
          const submissionData = r.data;

          if (submissionData.verdict === 'Judging' || submissionData.verdict === 'Pending') {
            setTimeout(() => pollSubmission(attempts + 1), 2000);
          } else {
            setSubmissionInfo({
              verdict: submissionData.verdict,
              isAccepted: /accepted/i.test(String(submissionData.verdict)),
            });
            setSubmitting(false);
          }
        } catch (pollErr) {
          console.error('Polling error', pollErr);
          setSubmissionInfo({ verdict: 'Error fetching result.', isAccepted: false });
          setSubmitting(false);
        }
      };
      pollSubmission();
    } catch (e) {
      alert('Submission failed: ' + (e?.response?.data?.error || e.message));
      setSubmitting(false);
    }
  }

  if (!prob || !contest) return <div>Loading...</div>;

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
      <div className="card">
        <h3>{prob.title}</h3>
        <div style={{whiteSpace:'pre-wrap'}} dangerouslySetInnerHTML={{__html: prob.description}} />
      </div>

      <div className="card">
        {contestExpired && (
          <div style={{color:'red', marginBottom:8}}>
            Contest is over. Submissions are disabled.
          </div>
        )}

        <div style={{marginBottom:8}}>
          <label>Language</label>{' '}
          <select value={langId} onChange={e=>setLangId(Number(e.target.value))} disabled={contestExpired}>
            {LANGS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        
        {/* Add the Timer component here, above the CodeEditor */}
        <Timer endTime={contest.endTime} />

        <CodeEditor
          code={code}
          setCode={setCode}
          contest={contest}
          contestExpired={contestExpired}
        />

        <div style={{marginTop:8}}>
          <button onClick={submit} disabled={submitting || contestExpired}>
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>

        {submissionInfo && (
          <div style={{ marginTop: 12 }}>
            <h4>Submission result</h4>
            <div style={{
              padding: 12,
              borderRadius: 8,
              background: submissionInfo.isAccepted ? '#e6ffed' : '#fff5f5',
              border: '1px solid #eee'
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                {submissionInfo.verdict}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}