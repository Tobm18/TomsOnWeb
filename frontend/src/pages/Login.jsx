import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register } from '../lib/auth'

export default function Login() {
  const [activeTab, setActiveTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleAuthSuccess = () => {
    const selectedGame = localStorage.getItem('selectedGame')
    if (selectedGame) {
      navigate('/game')
    } else {
      navigate('/')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      handleAuthSuccess()
    } catch (err) {
      if (err.message === 'Invalid credentials') {
        setError('Email ou mot de passe incorrect.')
      } else {
        setError('Une erreur est survenue lors de la connexion.')
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(username, email, password)
      // After registration, auto login
      await login(email, password)
      handleAuthSuccess()
    } catch (err) {
      if (err.message === 'Email already in use') {
        setError('Cette adresse email est déjà utilisée.')
      } else if (err.message === 'Username already in use') {
        setError('Ce nom d\'utilisateur est déjà utilisé.')
      } else if (err.message === 'Username must be at most 20 characters') {
        setError('Le nom d\'utilisateur doit contenir au maximum 20 caractères.')
      } else {
        setError('Une erreur est survenue lors de l\'inscription.')
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="blue-glow-1"></div>
      <div className="blue-glow-2"></div>
      <div className="blue-glow-3"></div>
      <div className="blue-glow-4"></div>
      <div className="blue-glow-5"></div>

      <main>
        <div className="login-container">
          <div className="login-card">
            <h2 className="login-title">Bienvenue sur <span className="colored-title">Games on Web</span></h2>
            
            <div className="tabs">
              <button className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`} onClick={() => { setActiveTab('login'); setError(null); }}>
                <i className="fa-solid fa-right-to-bracket"></i> Connexion
              </button>
              <button className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`} onClick={() => { setActiveTab('register'); setError(null); }}>
                <i className="fa-solid fa-user-plus"></i> Inscription
              </button>
            </div>

            {error && (
              <div className="error-message">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}

            <form className={`auth-form ${activeTab === 'login' ? 'active' : ''}`} onSubmit={handleSubmit}>
              <div className="form-group">
                <label><i className="fa-solid fa-envelope"></i> Adresse email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Entrez votre adresse email" required />
              </div>
              <div className="form-group password-wrapper">
                <label><i className="fa-solid fa-lock"></i> Mot de passe</label>
                <input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Entrez votre mot de passe" required />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                  <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
                </button>
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                <i className="fa-solid fa-right-to-bracket"></i> {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <form className={`auth-form ${activeTab === 'register' ? 'active' : ''}`} onSubmit={handleRegister}>
              <div className="form-group">
                <label><i className="fa-solid fa-user"></i> Nom d'utilisateur</label>
                <input value={username} onChange={e => setUsername(e.target.value)} type="text" placeholder="Choisissez un nom d'utilisateur" required maxLength={20} />
              </div>
              <div className="form-group">
                <label><i className="fa-solid fa-envelope"></i> Adresse email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Entrez votre adresse email" required />
              </div>
              <div className="form-group password-wrapper">
                <label><i className="fa-solid fa-lock"></i> Mot de passe</label>
                <input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Choisissez un mot de passe" required />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                  <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
                </button>
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                <i className="fa-solid fa-user-plus"></i> {loading ? 'Inscription...' : 'S\'inscrire'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

