// frontend/src/components/Leaderboard.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Leaderboard() {
  const { id: contestId } = useParams();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!contestId) return;
      try {
        setLoading(true);
        const res = await API.get(`/contest/${contestId}/leaderboard`);
        const data = res.data?.leaderboard ?? res.data ?? [];
        setLeaderboard(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetchLeaderboard error:", err);
        setError(err?.response?.data?.error || err?.message || "Failed");
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [contestId]);

  if (loading) return <div>Loading leaderboard…</div>;
  if (error) return <div style={{ color: "red" }}>Error: {String(error)}</div>;

  return (
    <div className="card">
      <h2>🏆 Contest Leaderboard</h2>
      {leaderboard.length === 0 ? (
        <div>No participants / scores yet.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
          <thead>
            <tr>
              <th style={{ padding: 8 }}>Rank</th>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Solved</th>
              <th style={{ padding: 8 }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row, i) => (
              <tr key={row.userId || i} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{i + 1}</td>
                <td style={{ padding: 8 }}>{row.name}</td>
                <td style={{ padding: 8 }}>{row.solved}</td>
                <td style={{ padding: 8 }}>{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button style={{ marginTop: 16 }} onClick={() => navigate("/contest")}>🔙 Back to Contests</button>
    </div>
  );
}
