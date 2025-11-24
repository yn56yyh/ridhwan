import { useState } from 'react'
import { LayoutDashboard, History, User } from 'lucide-react'
import Home from './pages/Home'
import GameSession from './pages/GameSession'
import LeagueSetup from './pages/LeagueSetup'
import LeagueList from './pages/LeagueList'
import LeagueDetail from './pages/LeagueDetail'
import SessionSetup from './pages/SessionSetup'
import SessionSummary from './components/SessionSummary'
import SessionDashboard from './components/SessionDashboard'
import GameHistory from './components/GameHistory'
import StatisticsDashboard from './components/StatisticsDashboard'
import Profile from './components/Profile'
import { useGame } from './context/GameContext'

function App() {
  const [activeView, setActiveView] = useState('home')
  const [viewStack, setViewStack] = useState([])
  const [eventContext, setEventContext] = useState(null)
  const [sessionContext, setSessionContext] = useState(null)

  const { createEvent, addSessionToEvent, getEventById } = useGame()

  const pushView = (view, context = null) => {
    setViewStack(prev => [...prev, { view: activeView, context: eventContext }])
    setActiveView(view)
    if (context) setEventContext(context)
  }

  const popView = () => {
    if (viewStack.length > 0) {
      const previous = viewStack[viewStack.length - 1]
      setViewStack(prev => prev.slice(0, -1))
      setActiveView(previous.view)
      setEventContext(previous.context)
    } else {
      setActiveView('home')
      setEventContext(null)
    }
  }

  const handleHomeNavigation = (destination) => {
    switch (destination) {
      case 'league':
        pushView('league-list', { type: 'league' })
        break
      case 'tournament':
        pushView('league-list', { type: 'tournament' })
        break
      case 'statistics':
        setActiveView('stats')
        break
      case 'settings':
        setActiveView('profile')
        break
      default:
        break
    }
  }

  const handleCreateEvent = (type, name, bowlingAlley) => {
    const newEvent = createEvent(type, name, bowlingAlley)
    setEventContext({ eventId: newEvent.id })
    setActiveView('league-detail')
  }

  const handleStartSession = (sessionData) => {
    setSessionContext({
      ...sessionData,
      games: []
    })
    setActiveView('game-session')
  }

  const handleGameComplete = (gameData) => {
    // If no game data (e.g. X button clicked), go back to league detail or home
    if (!gameData || typeof gameData.score === 'undefined') {
      if (sessionContext) {
        setActiveView('league-detail')
      } else {
        setActiveView('home')
      }
      return
    }

    // Add game to current session
    const updatedGames = [...(sessionContext.games || []), gameData]

    // Update session context with new game
    setSessionContext(prev => ({
      ...prev,
      games: updatedGames
    }))

    // Check if session is complete
    if (updatedGames.length >= sessionContext.gamesCount) {
      // Session complete - show session summary
      setActiveView('session-summary')
    } else {
      // Continue to next game in session
      setActiveView('game-session')
    }
  }

  const handleSessionComplete = () => {
    // Save session to event
    addSessionToEvent(eventContext.eventId, {
      date: sessionContext.date,
      games: sessionContext.games
    })
    // Return to league detail
    setSessionContext(null)
    setActiveView('league-detail')
  }

  // Full-screen views (no bottom nav)
  if (activeView === 'home') {
    return <Home onNavigate={handleHomeNavigation} />
  }

  if (activeView === 'league-setup') {
    return (
      <LeagueSetup
        type={eventContext?.type}
        onBack={popView}
        onCreate={handleCreateEvent}
      />
    )
  }

  if (activeView === 'league-list') {
    return (
      <LeagueList
        type={eventContext?.type}
        onBack={popView}
        onSelectEvent={(eventId) => pushView('league-detail', { eventId })}
        onCreateNew={() => pushView('league-setup', { type: eventContext.type })}
      />
    )
  }

  if (activeView === 'league-detail') {
    const event = getEventById(eventContext?.eventId)
    return (
      <LeagueDetail
        eventId={eventContext?.eventId}
        onBack={popView}
        onAddSession={() => pushView('session-setup', eventContext)}
        onSessionClick={(session) => {
          setSessionContext(session);
          setActiveView('session-dashboard');
        }}
      />
    )
  }

  if (activeView === 'session-setup') {
    const event = getEventById(eventContext?.eventId)
    return (
      <SessionSetup
        event={event}
        onBack={popView}
        onStart={handleStartSession}
      />
    )
  }

  if (activeView === 'session-dashboard' && sessionContext) {
    return (
      <SessionDashboard
        sessionData={sessionContext}
        onBack={() => {
          setSessionContext(null);
          setActiveView('league-detail');
        }}
      />
    );
  }

  if (activeView === 'session-summary') {
    return (
      <SessionSummary
        sessionData={sessionContext}
        onComplete={handleSessionComplete}
      />
    )
  }

  if (activeView === 'game-session') {
    const isLastGame = sessionContext && (sessionContext.games?.length || 0) + 1 >= sessionContext.gamesCount

    return (
      <GameSession
        key={sessionContext?.games?.length || 0}
        isLastGame={isLastGame}
        onEndSession={(gameData) => {
          if (sessionContext) {
            handleGameComplete(gameData)
          } else {
            // Standalone game
            setActiveView('home')
          }
        }}
      />
    )
  }

  // Views with bottom navigation
  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1>Bowling Tracker</h1>
      </header>

      <main>
        {activeView === 'history' && <GameHistory />}
        {activeView === 'stats' && <StatisticsDashboard />}
        {activeView === 'profile' && <Profile />}
      </main>

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--bg-tertiary)',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-around',
        zIndex: 100
      }}>
        <NavIcon
          icon={<LayoutDashboard size={24} />}
          label="Home"
          active={activeView === 'home'}
          onClick={() => {
            setActiveView('home')
            setViewStack([])
            setEventContext(null)
            setSessionContext(null)
          }}
        />
        <NavIcon
          icon={<History size={24} />}
          label="History"
          active={activeView === 'history'}
          onClick={() => setActiveView('history')}
        />
        <NavIcon
          icon={<User size={24} />}
          label="Profile"
          active={activeView === 'profile'}
          onClick={() => setActiveView('profile')}
        />
      </nav>
    </div>
  )
}

function NavIcon({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: active ? 'var(--accent-color)' : 'var(--text-secondary)',
        cursor: 'pointer'
      }}
    >
      {icon}
      <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{label}</span>
    </div>
  )
}

export default App
