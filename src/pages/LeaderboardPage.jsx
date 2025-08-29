// frontend/src/pages/LeaderboardPage.jsx
import React from 'react';
import Leaderboard from '../components/Leaderboard';

export default function LeaderboardPage() {
  // Simply render the existing Leaderboard component (which expects contest id via useParams)
  return <Leaderboard />;
}
