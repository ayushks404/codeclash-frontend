import React, { useState, useContext  } from 'react'
import API from '../services/api'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext';



export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();
  const { login } = useContext(AuthContext); // 3. Get login function from context

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email: email.trim(), password });
      login(res.data.token); // 4. Use the context login function
      nav('/home');
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  }


  return (
    <div className="card" style={{maxWidth:400,margin:'40px auto'}}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div><input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div><input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button type="submit">Login</button>
      </form>
      <div style={{marginTop:10}}>No account? <Link to="/register">Register</Link></div>
    </div>
  )
}
