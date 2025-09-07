// src/pages/HomePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import API from '../services/api';

function splitByStatus(contests){
  const now = Date.now();
  const live = [];
  const upcoming = [];
  for (const c of (contests || [])){
    const s = new Date(c.startTime).getTime();
    const e = new Date(c.endTime).getTime();
    if (now >= s && now <= e) live.push(c);
    else if (now < s) upcoming.push(c);
  }
  return { live, upcoming };
}

export default function HomePage(){
  // rename to plural for clarity
  const [contests, setContests] = useState([]);
  const [form, setForm] = useState({ name: '', startTime: '', endTime: '', numQuestions: 5 });
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  useEffect(() => {
    fetchContests();
    // optional: poll every 30s
    const int = setInterval(fetchContests, 30000);
    return () => clearInterval(int);
  }, []);

  async function fetchContests(){
    try {
      const r = await API.get('/contest'); // <-- NOTE: no extra /api here
      setContests(r.data || []);
    } catch (err) {
      console.error("fetchContests:", err);
      setMessage('Failed to load contests');
      setMessageType('error');
    }
  }

  const groups = useMemo(() => splitByStatus(contests), [contests]);

  // inside HomePage component
const [submitting, setSubmitting] = useState(false);

async function createContest(e){
  e.preventDefault();
  if (submitting) return;
  setSubmitting(true);
  try{
    await API.post('/contest', {
      name: form.name,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
      numQuestions: Number(form.numQuestions || 5)
    });
    const r = await API.get('/contest');
    setContests(r.data || []);
    setMessage('Contest created successfully!');
    setMessageType('success');
    setForm({ name: '', startTime: '', endTime: '', numQuestions: 5 });
    
    
    // --- NEW: notify any open editor components to reset immediately (do NOT delete drafts)
    window.dispatchEvent(new Event('contestCreatedResetEditor'));
  
  } catch(err){
    console.error("createContest:", err);
    setMessage(err?.response?.data?.error || err?.response?.data?.message || err.message || 'Failed to create contest.');
    setMessageType('error');
  } finally {
    setSubmitting(false);
  }
}


  // Replace your old join function with this one
  async function join(id){
    try{
      // First, join the contest as usual
      await API.post(`/contest/${id}/join`);

      // Second, fetch the contest to check if it has questions
      const r = await API.get(`/contest/${id}`);
      const contest = r.data?.contest || r.data;

      // Third, if no questions are assigned, ask the server to assign them
      if (!contest?.questions || contest.questions.length === 0) {
        try {
          // This call requires a valid token, which your api.js service provides
          await API.post(`/contest/${id}/assign-random`);
        } catch (assignErr) {
          // Log a warning but don't stop the user from proceeding
          console.warn("Could not auto-assign questions:", assignErr);
        }
      }

      // Finally, navigate the user to the contest page
      window.location.href = `/contest/${id}`;
    } catch(err){
      console.error("join:", err);
      setMessage(err?.response?.data?.error || err?.response?.data?.message || err.message || 'Failed to join contest.');
      setMessageType('error');
    }
  }

  return (
    <div className="row">
      <div className="card">
        <h3>Create Contest</h3>
        {message && <div className={messageType==='error' ? 'alert error' : 'alert success'} style={{marginBottom:8}}>{message}</div>}
        <form onSubmit={createContest}>
          <input placeholder="Contest name" value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} />
          <label>Start Time</label>
          <input type="datetime-local" value={form.startTime} onChange={e=>setForm(f=>({...f, startTime:e.target.value}))}/>
          <label>End Time</label>
          <input type="datetime-local" value={form.endTime} onChange={e=>setForm(f=>({...f, endTime:e.target.value}))}/>
          <label>Number of Questions</label>
          <input type="number" value={form.numQuestions} onChange={e=>setForm(f=>({...f, numQuestions:Number(e.target.value||5)}))}/>
          <button type="submit">Create</button>
        </form>
      </div>

      <div className="card">
        <h3>Join Contest</h3>

        <h4>Live</h4>
        {groups.live.length === 0 && <div>No live contests</div>}
        {groups.live.map(c=>(
          <div key={c._id} className="card" style={{marginTop:8}}>
            <div><strong>{c.name}</strong></div>
            <div>{new Date(c.startTime).toLocaleString()} — {new Date(c.endTime).toLocaleString()}</div>
            <button onClick={()=>join(c._id)}>Join</button>
          </div>
        ))}

        <h4 style={{marginTop:16}}>Upcoming</h4>
        {groups.upcoming.length === 0 && <div>No upcoming contests</div>}
        {groups.upcoming.map(c=>(
          <div key={c._id} className="card" style={{marginTop:8}}>
            <div><strong>{c.name}</strong></div>
            <div>Starts: {new Date(c.startTime).toLocaleString()}</div>
            <button onClick={()=>join(c._id)}>Join</button>
          </div>
        ))}
      </div>
    </div>
  );
}
