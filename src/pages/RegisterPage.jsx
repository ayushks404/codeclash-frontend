
import React, { useState, useContext } from 'react'; // 1. Import useContext
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // 2. Import AuthContext

export default function RegisterPage(){
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const nav = useNavigate()
  const { login } = useContext(AuthContext); // 3. Get login function from context

  async function submit(e){
    e.preventDefault()
    try{
      const res = await API.post('/auth/register',{ name: name.trim(), email: email.trim(), password })
      login(res.data.token); // 4. Use context login (it also sets localStorage)
      nav('/home')
    }catch(err){
      alert(err?.response?.data?.message||err.message)
    }
  }

  
  return (
    <div className="card" style={{maxWidth:500,margin:'40px auto'}}>
      <h2>Create your account</h2>
      <form onSubmit={submit}>
        <div><input placeholder="name" value={name} onChange={e=>setName(e.target.value)} /></div>
        <div><input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div><input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button type="submit">Register</button>
      </form>
      <div style={{marginTop:10}}>Already have an account? <a className="link" href="/login">Login</a></div>
    </div>
  )
}
