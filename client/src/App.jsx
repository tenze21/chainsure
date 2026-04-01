import { useState } from 'react'
import './App.css'
import Overview from './pages/Overview'
import Marketplace from './pages/Marketplace'
import Policies from './pages/Policies'
import TravelProposalForm from './pages/TravelProposalForm'
import MotorProposalForm from './pages/MotorProposalForm'
import LifeProposalForm from './pages/LifeProposalForm'
import UserProfile from './pages/UserProfile'

function App() {
  const [page, setPage] = useState('overview')

  const renderPage = () => {
    switch (page) {
      case 'overview':
        return <Overview onNavigate={setPage} />
      case 'marketplace':
        return <Marketplace onNavigate={setPage} />
      case 'policies':
        return <Policies onNavigate={setPage} />
      case 'profile':
        return <UserProfile onNavigate={setPage} />
      case 'proposal-travel':
        return <TravelProposalForm onBack={() => setPage('marketplace')} onNavigate={setPage} />
      case 'proposal-motor':
        return <MotorProposalForm onBack={() => setPage('marketplace')} onNavigate={setPage} />
      case 'proposal-life':
        return <LifeProposalForm onBack={() => setPage('marketplace')} onNavigate={setPage} />
      default:
        return <Overview onNavigate={setPage} />
    }
  }

  return renderPage()
}

export default App