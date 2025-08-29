import React, { useEffect, useState } from 'react'
import API from '../services/api'
import { Link } from 'react-router-dom'
export default function ContestsList(){
  const [contests,setContests]=useState([])
  useEffect(()=>{ fetchAll() },[])
  async function fetchAll(){ try{ const res = await API.get('/contests'); setContests(res.data) }catch(e){console.error(e)} }
  return (
    <div>
      <h2>Contests</h2>
      <div style={{display:'grid',gap:12}}>
        {contests.map(c=> (
          <div key={c._id} className="card">
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <div>
                <div style={{fontWeight:700}}>{c.name}</div>
                <div style={{fontSize:12,color:'#666'}}>{new Date(c.startTime).toLocaleString()} - {new Date(c.endTime).toLocaleString()}</div>
              </div>
              <div>
                <Link to={`/contest/${c._id}`}>Open</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
