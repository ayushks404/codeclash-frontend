// src/pages/ContestList.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';

export default function ContestList(){
  const [contests, setContests] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try{
        const r = await API.get('/contest'); // no extra /api
        setContests(r.data || []);
      }catch(e){
        console.error(e);
      }
    };
    fetchAll();
  }, []);

  return (
    <div>
      <h2>Contests</h2>
      {contests.map(c => <div key={c._id}>{c.name}</div>)}
    </div>
  );
}
