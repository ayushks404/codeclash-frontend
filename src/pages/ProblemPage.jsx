// // src/pages/ProblemPage.jsx
// import React, { useEffect, useState, useRef } from 'react';
// import API from '../services/api';
// import { useParams, useNavigate } from "react-router-dom";
// import CodeEditor from "../components/CodeEditor";

// const LANGS = [
//   { 
//     id: 54, 
//     name: 'C++ (g++)', 
//     template: `#include <iostream>
// using namespace std;

// int main() {
//     // Write your code here
//     cout << "Hello World" << endl;
//     return 0;
// }`
//   },
//   { 
//     id: 71, 
//     name: 'Python (3)', 
//     template: `# Write your code here
// print("Hello World")`
//   },
//   { 
//     id: 63, 
//     name: 'JavaScript (node)', 
//     template: `// Write your code here
// console.log("Hello World");`
//   }
// ];

// export default function ProblemPage(){
//   const { id: contestId, pid } = useParams();
//   const navigate = useNavigate();

//   const [contest, setContest] = useState(null);
//   const [contestExpired, setContestExpired] = useState(false);

//   const [prob, setProb] = useState(null);
//   const [langId, setLangId] = useState(LANGS[0].id);
//   const [code, setCode] = useState(LANGS[0].template);
//   const [submitting, setSubmitting] = useState(false);
//   const [submissionInfo, setSubmissionInfo] = useState(null);

//   // Guard to ensure we only redirect once (prevents repeated alerts/navigation)
//   const redirectedRef = useRef(false);

//   // Fetch problem
//   useEffect(() => { fetchProb(); }, [pid]);

//   // Contest timer check
//   useEffect(() => {
//     fetchContest();
//     const interval = setInterval(fetchContest, 5000); // poll every 5s
//     return () => clearInterval(interval);
//   }, [contestId]);

//   async function fetchContest(){
//     try {
//       const res = await API.get(`/contest/${contestId}`);
//       const data = res.data.contest || res.data;
//       setContest(data);

//       const now = Date.now();
//       const endTime = new Date(data.endTime).getTime();

//       if (now > endTime && !redirectedRef.current) {
//         // mark as redirected so this branch won't run again
//         redirectedRef.current = true;

//         setContestExpired(true);
//         // Redirect to leaderboard page for this contest
//         // You can remove the alert for smoother UX if you prefer
//         alert("Contest is over. Redirecting to leaderboard...");
//         console.log(data)
//         navigate(`/contest/${data._id}/leaderboard`);
//       }
//     } catch(err) {
//       console.error("fetchContest error:", err);
//     }
//   }

//   // reset editor when problem/lang changes
//   useEffect(() => {
//     const found = LANGS.find(l => l.id === Number(langId));
//     if (found) setCode(found.template);
//     setSubmissionInfo(null);
//   }, [contestId, pid, langId]);

//   async function fetchProb(){
//     try {
//       const res = await API.get(`/questions/${pid}`);
//       setProb(res.data);
//       const found = LANGS.find(l => l.id === Number(langId));
//       if (found) setCode(found.template);
//     } catch(e){
//       console.error('fetchProb error:', e);
//     }
//   }




//   // ⛔️ Block submissions if contest expired
//   async function submit(){
//     if (contestExpired) {
//       alert("Contest is over. Submissions are disabled.");
//       return;
//     }
//     if (submitting) return;
//     setSubmitting(true);
//     setSubmissionInfo(null);
//     try{
//       const payload = {
//         language_id: Number(langId),
//         source_code: code,
//         questionId: pid,
//         contestId: contestId
//       };

//       const res = await API.post('/submissions', payload);
//       console.log('submission POST response', res);

//       // Expecting backend to return { token, submissionId } (token is Judge0 token)
//       const token = res?.data?.token || res?.token || res?.data?.submissionId;
//       if (!token) {
//         alert('Submission accepted by server but no Judge0 token returned.');
//         setSubmissionInfo({ verdict: 'Unknown', isAccepted: false });
//         setSubmitting(false);
//         return;
//       }

//       setSubmissionInfo({ verdict: 'Pending', isAccepted: false });

//       // Poll server for result
//       let attempts = 0;
//       const maxAttempts = 60;
//       const pollIntervalMs = 1000;

//       const pollJudge = async () => {
//         try {
//           const r = await API.get(`/submissions/${token}`);
//           const judge = r?.data?.judge || r?.data;
//           const verdict =
//             judge?.status?.description ||
//             judge?.status?.message ||
//             (judge?.status?.id === 3 ? 'Accepted' : 'Unknown');

//           setSubmissionInfo({ verdict, isAccepted: /accepted/i.test(String(verdict)) });

//           if (judge?.status?.id && judge.status.id <= 2 && attempts < maxAttempts) {
//             attempts += 1;
//             setTimeout(pollJudge, pollIntervalMs);
//             return;
//           }

//           setSubmitting(false);
//         } catch (errPoll) {
//           console.error('Polling error', errPoll);
//           attempts += 1;
//           if (attempts < maxAttempts) {
//             setTimeout(pollJudge, pollIntervalMs);
//           } else {
//             setSubmissionInfo({ verdict: 'Unknown', isAccepted: false });
//             setSubmitting(false);
//           }
//         }
//       };

//       pollJudge();
//     } catch(e){
//       console.error('submit error', e);
//       alert('Submission failed: ' + (e?.response?.data?.error || e?.response?.data?.message || e.message));
//       setSubmitting(false);
//     }
//   }



  
//   function summarizeSubmission(payload){
//     if (!payload) return null;
//       const verdict = payload.verdict
//       || payload.status?.status?.description
//       || payload.status?.message
//       || (payload.status?.status?.id === 3 ? 'Accepted' : null)
//       || 'Pending';
//     return { verdict, isAccepted: /accepted/i.test(String(verdict)) };
//   }

//   if (!prob) return <div>Loading...</div>;

//   return (
//     <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
//       <div className="card">
//         <h3>{prob.title}</h3>
//         <div style={{whiteSpace:'pre-wrap'}} dangerouslySetInnerHTML={{__html: prob.description}} />
//       </div>

//       <div className="card">
//         {contestExpired && (
//           <div style={{color:'red', marginBottom:8}}>
//             Contest is over. Submissions are disabled.
//           </div>
//         )}

//         <div style={{marginBottom:8}}>
//           <label>Language</label>{' '}
//           <select value={langId} onChange={e=>setLangId(Number(e.target.value))} disabled={contestExpired}>
//             {LANGS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
//           </select>
//         </div>

//         <CodeEditor
//           code={code}
//           setCode={setCode}
//           contest={contest}
//           contestExpired={contestExpired}
//         />

//         <div style={{marginTop:8}}>
//           <button onClick={submit} disabled={submitting || contestExpired}>
//             {submitting ? 'Submitting…' : 'Submit'}
//           </button>
//         </div>

//         {submissionInfo && (
//           <div style={{ marginTop: 12 }}>
//             <h4>Submission result</h4>
//             <div style={{
//               padding: 12,
//               borderRadius: 8,
//               background: submissionInfo.isAccepted ? '#e6ffed' : '#fff5f5',
//               border: '1px solid #eee'
//             }}>
//               <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
//                 {submissionInfo.verdict}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// frontend/src/pages/ProblemPage.jsx

import React, { useEffect, useState, useRef } from 'react';
import API from '../services/api';
import { useParams, useNavigate } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";

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

      // 1. The backend now returns a submissionId from our own database
      const res = await API.post('/submissions', payload);
      const submissionId = res.data.submissionId;

      if (!submissionId) {
        alert('Failed to initiate submission on the server.');
        setSubmitting(false);
        return;
      }

      setSubmissionInfo({ verdict: 'Judging...', isAccepted: false });

      // 2. Poll our own server for the result using the submissionId
      const pollSubmission = async (attempts = 0) => {
        // Stop polling after 60 seconds (30 attempts * 2s)
        if (attempts > 30) {
          setSubmissionInfo({ verdict: 'Polling timed out.', isAccepted: false });
          setSubmitting(false);
          return;
        }

        try {
          const r = await API.get(`/submissions/${submissionId}`);
          const submissionData = r.data;

          // 3. Check if still judging, if so, poll again after 2 seconds
          if (submissionData.verdict === 'Judging' || submissionData.verdict === 'Pending') {
            setTimeout(() => pollSubmission(attempts + 1), 2000);
          } else {
            // 4. We have a final verdict! Update the UI.
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

      // Start the first poll
      pollSubmission();

    } catch (e) {
      alert('Submission failed: ' + (e?.response?.data?.error || e.message));
      setSubmitting(false);
    }
  }



  if (!prob) return <div>Loading...</div>;

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