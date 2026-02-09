import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AvatarPopup from './AvatarPopup.jsx'

export default function Header() {
  const navigate = useNavigate()
  const { user, login, logout, loading } = useAuth()
  const [isPopupVisible, setIsPopupVisible] = useState(false)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
  const hoverTimeoutRef = useRef(null)
  const avatarRef = useRef(null)
  const lastScrollTopRef = useRef(0)

  useEffect(() => {
    const scrollThreshold = 10

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      
      if (Math.abs(scrollTop - lastScrollTopRef.current) < 10) {
        return
      }
      
      if (scrollTop > lastScrollTopRef.current && scrollTop > scrollThreshold) {
        // Scroll vers le bas - masquer le header
        setIsHeaderHidden(true)
      } else {
        // Scroll vers le haut - afficher le header
        setIsHeaderHidden(false)
      }
      
      lastScrollTopRef.current = scrollTop
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleLogout() {
    logout()
      .then(() => {
        navigate('/')
      })
      .catch(() => {
        navigate('/')
      })
  }

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsPopupVisible(true)
    }, 850)
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }

  const handleClick = () => {
    if (isPopupVisible) {
      setIsPopupVisible(false)
    } else {
      setIsPopupVisible(true)
    }
  }

  const closePopup = () => {
    setIsPopupVisible(false)
  }

  return (
    <header className={`${isHeaderHidden ? 'header-hidden' : ''} ${loading ? 'header-loading' : ''}`}>
      <div className="wrapper-left">
        <button className="logout-btn" id="logout-btn" onClick={handleLogout} style={{display: user ? 'block' : 'none'}}>
          <i className="fa-solid fa-right-from-bracket"></i> Déconnexion
        </button>
        <div className="fantom-logo" id="fantom-logo" style={{display: user ? 'none' : 'block'}}></div>
      </div>
      <h1 className='header-title' onClick={() => navigate( "/")}>Games on Web <span className="colored-title">2026</span></h1>
      <div className="wrapper-right">
        <div
          className="avatar"
          id="user-avatar"
          ref={avatarRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{
            background: user ? 'linear-gradient(135deg, #00aaff, #0044ff)' : 'rgba(0, 170, 255, 0.2)',
            cursor: 'pointer'
          }}
          title={user ? user.username : 'Non connecté'}
        >
          {user ? (
            <span style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'white'}}>
              {user.username.substring(0, 2).toUpperCase()}
            </span>
          ) : (
            <i className="fa-solid fa-user"></i>
          )}
        </div>
        <AvatarPopup isVisible={isPopupVisible} onClose={closePopup} user={user} />
      </div>
    </header>
  )
}
