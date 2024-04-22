import './App.css'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { env } from './env'
import { useEffect, useState } from 'react'
import AppRoutes from './components/routes/routes'
import { useNavigate } from 'react-router'
const stripePromise = loadStripe(env.PUBLIC_KEY_STRIPE)


function App() {
  const [currentRoute, setCurrentRoute] = useState(1)
  const navigate = useNavigate()
  function handleRouting(route) {
    setCurrentRoute(route)
    switch (route) {
      case 2:
        navigate('/list')
        break
      case 3:
        navigate('/admin')
        break
      case 1:
        navigate('/')
        break
      default:
        break
    }
  }
  return (
    <div className="App">
      <h1 style={{ padding: 20 }}>Stripe Payment Demo</h1>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div onClick={() => handleRouting(1)} className={currentRoute === 1 ? 'route choosen' : 'route'} style={{ paddingInline: 20 }}>Check out</div>
        <div onClick={() => handleRouting(2)} className={currentRoute === 2 ? 'route choosen' : 'route'} style={{ paddingInline: 20 }}>Listing</div>
        <div onClick={() => handleRouting(3)} className={currentRoute === 3 ? 'route choosen' : 'route'} style={{ paddingInline: 20 }}>Admin</div>
      </div>

      <Elements stripe={stripePromise}>
        <AppRoutes />
      </Elements>

    </div>
  )
}

export default App
