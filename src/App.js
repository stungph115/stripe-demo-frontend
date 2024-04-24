import './App.css'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { env } from './env'
import AppRoutes from './components/routes/routes'
import { useLocation, useNavigate } from 'react-router'
const stripePromise = loadStripe(env.PUBLIC_KEY_STRIPE)


function App() {
  const currentRoute = useLocation().pathname
  const navigate = useNavigate()
  return (
    <div className="App">
      <h1 style={{ padding: 20 }}>Stripe Payment Demo</h1>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div onClick={() => navigate('/')} className={currentRoute === '/' ? 'route choosen' : 'route'} style={{ paddingInline: 20 }}>Check out</div>
        <div onClick={() => navigate('/list')} className={currentRoute.startsWith('/list') ? 'route choosen' : 'route'} style={{ paddingInline: 20 }}>Listing</div>
        <div onClick={() => navigate('/admin/payment/all')} className={currentRoute.startsWith('/admin') ? 'route choosen' : 'route'} style={{ paddingInline: 20 }}>Admin</div>
      </div>

      <Elements stripe={stripePromise}>
        <AppRoutes />
      </Elements>

    </div>
  )
}

export default App
