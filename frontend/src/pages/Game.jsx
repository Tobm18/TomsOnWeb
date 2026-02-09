import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useScores } from '../context/ScoreContext'

export default function Game() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const { scores, updateScore } = useScores()
  const gameContainerRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const selectedGame = localStorage.getItem('selectedGame')
  const gameScores = scores[selectedGame] || { topScore: null, personalScore: null }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    const handleMessage = async (event) => {
      if (event.data.type === 'GAME_OVER') {
        const { score } = event.data
        if (selectedGame) {
          updateScore(selectedGame, score)
        }
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    window.addEventListener('message', handleMessage)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      window.removeEventListener('message', handleMessage)
    }
  }, [user, selectedGame, updateScore])

  useEffect(() => {
    if (loading) return

    const storedGame = localStorage.getItem('selectedGame')
    if (!storedGame) {
      navigate('/')
      return
    }

    if (!user) {
      navigate('/login')
    } 
  }, [user, loading, navigate])

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return
    
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  const gameNames = { 'keep-it-alive': 'Keep It Alive', fantasy: 'Fantasy Realm', space: 'Space Odyssey' }

  return (
    <div className="game-page">
      <div className="blue-glow-1"></div>
      <div className="blue-glow-2"></div>
      <div className="blue-glow-3"></div>
      <div className="blue-glow-4"></div>
      <div className="blue-glow-5"></div>

      <main style={{ height: selectedGame === 'keep-it-alive' ? '85vh' : 'auto' }}>
        {selectedGame === 'keep-it-alive' ? (
          <div className="keep-it-alive-wrapper">
            <div className="game-controls">
              <div className="game-controls-btns">
                <button className="control-btn" onClick={() => navigate('/')}>
                  <i className="fa-solid fa-arrow-left"></i> Retour à l'accueil
                </button>
                <button className="control-btn" onClick={toggleFullscreen}>
                  <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
                  {isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
                </button>
              </div>
              
              <div className="game-status-scores">
                <div className="score-item">
                  <span className="score-item-title">Meilleur score :</span>
                  <span>{gameScores.topScore ? `${gameScores.topScore.score} pts (${gameScores.topScore.playerName})` : 'Aucun'}</span>
                </div>
                <div className='score-item-separator'></div>
                <div className="score-item">
                  <span className="score-item-title">Ton Record:</span>
                  <span>{gameScores.personalScore ? `${gameScores.personalScore.score} pts` : '0 pts'}</span>
                </div>
              </div>
            </div>
            <div className="keep-it-alive-frame-container" ref={gameContainerRef}>
              <iframe 
                src="/games/keep-it-alive/index.html" 
                title="Keep It Alive"
                allow="fullscreen"
              />
            </div>
          </div>
        ) : (
          <div className="coming-soon-container">
            <div className="game-info">
              <div className="game-icon">
                <i className="fa-solid fa-gamepad"></i>
              </div>
              <h1 className="game-title">{selectedGame ? (gameNames[selectedGame] || 'Jeu') : 'Jeu'}</h1>
              <div className="coming-soon-badge">
                <span className="badge-text">Coming Soon</span>
              </div>
              <p className="coming-soon-message">
                Ce jeu sera bientôt disponible !<br />
                Restez connecté pour ne pas manquer son lancement.
              </p>
              <div className="action-buttons">
                <button className="btn-primary" onClick={() => navigate('/')}>
                  <i className="fa-solid fa-home"></i> Retour à l'accueil
                </button>
                <button className="btn-secondary">
                  <i className="fa-solid fa-bell"></i> Me notifier
                </button>
              </div>
            </div>
            <div className="decoration-line"></div>
          </div>
        )}
      </main>
    </div>
  )
}