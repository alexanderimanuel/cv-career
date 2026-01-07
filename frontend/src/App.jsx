import { useState } from 'react'
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion'
import InputForm from './components/InputForm'
import ResultsDashboard from './components/ResultsDashboard'
import Navbar from './components/Navbar'
import ParticleField from './components/ParticleField'
import HeroAnimation from './components/HeroAnimation'
import { Sparkles, Loader2 } from 'lucide-react'
import DocsPage from './components/DocsPage'
import GetStartedPage from './components/GetStartedPage'
import Footer from './components/Footer'
import './index.css'
import './components/hero.css'
import './components/improvements.css'
import { analyzeWithBackend } from './services/api'

function App() {
  const [view, setView] = useState('home')
  const [analysisData, setAnalysisData] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async (formData) => {
    setIsAnalyzing(true)

    try {
      // Use centralized API service
      const data = await analyzeWithBackend(formData);
      setAnalysisData(data)
      setTimeout(() => {
        setIsAnalyzing(false)
        setView('results')
      }, 1500)
    } catch (error) {
      console.error('Analysis error:', error)
      const errorMessage = error.message || 'Terjadi kesalahan saat analisis. Silakan coba lagi.'
      alert(`Gagal: ${errorMessage}`)
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      <Navbar setView={setView} />
      {/* Deep Space Background */}
      <div className="deep-space-bg">
        <div className="geometric-grid" />
        {/* Decorative floating blobs */}
        <div className="float-blob purple" aria-hidden />
        <div className="float-blob orange" aria-hidden />
        <ParticleField />
      </div>

      {/* Main Container */}
      <div className="relative z-10 container-main">

        <AnimatePresence mode="wait">
          {view === 'docs' && <DocsPage onBack={() => setView('home')} />}
          {view === 'get-started' && <GetStartedPage onBack={() => setView('home')} onStart={() => setView('home')} />}

          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-7xl mx-auto"
            >
              {/* Hero Section */}
              <div className="hero-section w-full text-center mb-6 md:mb-12">
                <div className="hero-card" style={{ width: '100%', maxWidth: '100%' }}>
                  <div>
                    {/* Badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.08, duration: 0.6, type: 'spring', stiffness: 90 }}
                      className="flex justify-center mb-6"
                    >
                      <div className="badge">
                        <div className="badge-dot" />
                        <span>AI Powered Analysis</span>
                      </div>
                    </motion.div>

                    {/* Main Title */}
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18, duration: 0.7 }}
                      className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight"
                    >
                      <div className="text-white mb-1">CV</div>
                      <div className="gradient-text">ANALISIS</div>
                    </motion.h1>

                    {/* Tagline (short supporting text) */}
                    <motion.p
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="text-sm md:text-base max-w-2xl mx-auto leading-relaxed px-2 md:px-4"
                      style={{ color: 'var(--text-gray)' }}
                    >
                      Temukan jalur karir terbaikmu dalam hitungan detik.
                    </motion.p>

                    {/* Hero animation (lightweight svg) */}
                    <div className="mt-6 mb-2">
                      <HeroAnimation />
                    </div>

                    {/* Trust Badges */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                      className="flex justify-center items-center gap-6 mt-6 flex-wrap trust-row"
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <span>AI-Powered Insights</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check w-5 h-5 text-green-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
                        <span>Data Privacy Guaranteed</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock w-5 h-5 text-blue-400"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        <span>Instant Analysis</span>
                      </div>
                    </motion.div>

                    {/* Explicit Spacer - Balanced */}
                    <div style={{ height: '32px', width: '100%' }} />

                    <div className="flex justify-center pb-8">
                      <motion.button whileTap={{ scale: 0.98 }} onClick={() => {
                        const el = document.getElementById('upload-zone')
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }} className="btn-primary px-6 py-3">
                        Upload CV
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              {isAnalyzing ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-16 text-center"
                >
                  <Loader2 className="w-16 h-16 mx-auto mb-6 spinner" style={{ color: 'var(--accent-purple)' }} />
                  <h3 className="text-2xl font-bold mb-2">Analyzing Profile...</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Please wait while we process your data.</p>
                </motion.div>
              ) : (
                <InputForm onAnalyze={handleAnalyze} />
              )}
            </motion.div>
          )}

          {view === 'results' && analysisData && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >


              <ResultsDashboard data={analysisData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer - Show on all views, outside container for full width */}
      {view !== 'results' && <Footer />}
    </div >
  )
}

export default App
