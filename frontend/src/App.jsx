import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Game from './pages/Game'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import { AuthProvider } from './context/AuthContext'
import { ScoreProvider } from './context/ScoreContext'
import './css/index.css'

export default function App() {
  return (
    <AuthProvider>
      <ScoreProvider>
        <div>
          <Header />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/game" element={<Game />} />
          </Routes>
          <Footer />
        </div>
      </ScoreProvider>
    </AuthProvider>
  )
}
