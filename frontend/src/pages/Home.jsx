import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useScores } from '../context/ScoreContext'
import Spinner from '../components/Spinner'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { scores: allScores, loading: scoresLoading } = useScores()
  const [currentCard, setCurrentCard] = useState(0)

  const games = [
    { id: 'keep-it-alive', title: 'Keep It Alive', description: "Survivez le plus longtemps possible, mais attention aux obstacles !", img: '/images/keep-it-alive.png' },
    { id: 'fantasy', title: 'Fantasy Realm', description: 'Explorez des royaumes magiques et combattez des créatures légendaires.', img: '/assets/fantasy.jpg' },
    { id: 'space', title: 'Space Odyssey', description: 'Partez à la conquête de l\'espace et découvrez de nouvelles planètes.', img: '/assets/space.jpg' }
  ]

  const rotateCarousel = (direction) => {
    setCurrentCard((prev) => (prev + direction + games.length) % games.length)
  }

  async function handlePlayClick(gameName) {
    localStorage.setItem('selectedGame', gameName)
    if (user) {
      navigate('/game')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="home-page">
      <div className="blue-glow-1"></div>
      <div className="blue-glow-2"></div>
      <div className="blue-glow-3"></div>
      <div className="blue-glow-4"></div>
      <div className="blue-glow-5"></div>

      <main>
        <section className="introduction">
          <div className="welcome-content">
            <h2 className="welcome-title">Bienvenue à Games on Web</h2>
            <h1 className="welcome-year">2026</h1>
            <p className="welcome-subtitle">Découvrez les trois jeux de Tom BALLESTER pour l'édition de cette année.</p>
          </div>
          <div className="scroll-indicator" onClick={() => document.getElementById('games-section')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="arrow-down"><span></span><span></span><span></span></div>
            <p className="scroll-text">Découvrir les jeux</p>
          </div>
        </section>

        <section className="games" id="games-section">
          <h2>Les jeux de cette année</h2>
          <div className="carousel-container">
            <button className="carousel-btn prev-btn" onClick={() => rotateCarousel(-1)}>
              <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div className="carousel-wrapper">
              <div className="carousel">
                {games.map((game, index) => {
                  const position = (index - currentCard + games.length) % games.length
                  const gameData = allScores[game.id] || { topScore: null, personalScore: null };
                  const { topScore, personalScore } = gameData;
                  const isPlayerTop = user && topScore && personalScore && topScore.playerName === user.username;
                  const showPersonal = user && personalScore && !isPlayerTop;

                  return (
                    <div
                      key={game.id}
                      className={`game-card ${position === 0 ? 'active' : ''}`}
                      style={{ '--position': position }}
                    >
                      <div className="game-card-background" style={{ backgroundImage: `url('${game.img}')` }}></div>
                      <div className="game-card-content">
                        <div className="game-score">
                          <div className="top-score-info">
                            Meilleur joueur : {topScore ? (
                              <span>{topScore.playerName} <span className="score-link">{topScore.score} pts</span></span>
                            ) : (
                              <span>Aucun score</span>
                            )}
                          </div>
                          {showPersonal && (
                            <div className="personal-score-link">
                              Ton record : <span>{personalScore.score} pts</span>
                            </div>
                          )}
                        </div>
                        <h3>{game.title}</h3>
                        <p>{game.description}</p>
                        <button className="play-btn" onClick={() => handlePlayClick(game.id)}>Jouer</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <button className="carousel-btn next-btn" onClick={() => rotateCarousel(1)}>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </section>
        <Spinner show={scoresLoading} />
      </main>
    </div>
  )
}
