import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ScoreContext = createContext();

export function ScoreProvider({ children }) {
  const { user } = useAuth();
  const [rawScores, setRawScores] = useState(() => {
    const saved = localStorage.getItem('scores_cache_raw');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);

  const fetchAllScores = useCallback(async () => {
    if (rawScores.length === 0) setLoading(true);
    try {
      const res = await fetch('/api/scores');
      if (res.ok) {
        const data = await res.json();
        setRawScores(data);
        localStorage.setItem('scores_cache_raw', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error fetching scores:', err);
    } finally {
      setLoading(false);
    }
  }, [rawScores.length]);

  // Derived state: compute formatted scores for each game
  const scores = React.useMemo(() => {
    const gameIds = ['keep-it-alive', 'fantasy', 'space'];
    const results = {};

    gameIds.forEach(gameId => {
      // Top score for this game (list is already sorted by score desc from API)
      const topScore = rawScores.find(s => s.game === gameId);
      
      // Personal score for the logged-in user
      const personalScore = user 
        ? rawScores.find(s => s.game === gameId && s.playerName === user.username)
        : null;

      results[gameId] = { topScore, personalScore };
    });

    return results;
  }, [rawScores, user]);

  const updateScore = useCallback(async (gameId, score) => {
    if (!user) return;

    setRawScores(prev => {
      const existingIdx = prev.findIndex(s => s.game === gameId && s.playerName === user.username);
      let nextScores = [...prev];
      
      if (existingIdx > -1) {
        if (score <= prev[existingIdx].score) return prev; 
        nextScores[existingIdx] = { ...nextScores[existingIdx], score: score };
      } else {
        nextScores.push({ game: gameId, playerName: user.username, score: score });
      }
      
      const sorted = nextScores.sort((a, b) => b.score - a.score);
      localStorage.setItem('scores_cache_raw', JSON.stringify(sorted));
      return sorted;
    });
    
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: gameId,
          playerName: user.username,
          score: score
        })
      });
      
      if (response.ok) {
        // Optional: Background refresh to stay in sync with database IDs
        const res = await fetch('/api/scores');
        if (res.ok) {
          const data = await res.json();
          setRawScores(data);
          localStorage.setItem('scores_cache_raw', JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchAllScores();
  }, [fetchAllScores]);

  return (
    <ScoreContext.Provider value={{ scores, loading, refreshScores: fetchAllScores, updateScore }}>
      {children}
    </ScoreContext.Provider>
  );
}

export function useScores() {
  const context = useContext(ScoreContext);
  if (!context) {
    throw new Error('useScores must be used within a ScoreProvider');
  }
  return context;
}
