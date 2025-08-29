import React, { useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'
export default function CreateContestPage(){
  const [name,setName]=useState('')
  const [start,setStart]=useState('')
  const [end,setEnd]=useState('')
  const [num,setNum]=useState(5)
  const nav = useNavigate()
  async function submit(e){
    e.preventDefault()
    try {
    await API.post('/api/contest', { name, startTime: start, endTime: end, numQuestions: num });
      // Replace alert() with message state
    setMessage('Contest created successfully!');
      setMessageType('success');
      // Navigate to homepage after creation, maybe with a slight delay
      setTimeout(() => nav('/'), 1500);
    } catch (err) {
      // Replace alert() with message state
      setMessage(err?.response?.data?.message || err.message || 'Failed to create contest.');
      setMessageType('error');
    }
  }
  return (
    <div className="card" style={{maxWidth:600,margin:'20px auto'}}>
      <h2>Create Contest</h2>
      <form onSubmit={submit}>
        <div><input placeholder="name" value={name} onChange={e=>setName(e.target.value)} /></div>
        <div><label>Start</label><input type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} /></div>
        <div><label>End</label><input type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)} /></div>
        <div><input type="number" value={num} onChange={e=>setNum(e.target.value)} /></div>
        <button>Create</button>
      </form>
    </div>
  )
}
