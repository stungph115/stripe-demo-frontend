import './App.css';
import PaymentForm from './components/PaymentForm';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { env } from './env';
import { useState } from 'react';
import Listing from './components/Listing';
const stripePromise = loadStripe(env.PUBLIC_KEY_STRIPE);

function App() {
  const [route, setRoute] = useState(1)

  return (
    <div className="App">
      <h1 style={{ padding: 20 }}>Stripe Payment Demo</h1>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div onClick={() => setRoute(1)} className={route === 1 ? 'route choosen' : 'route'}>Check out forms</div>
        <div onClick={() => setRoute(2)} className={route === 2 ? 'route choosen' : 'route'}>Listing</div>
      </div>
      <Elements stripe={stripePromise}>
        {route === 1 &&
          <PaymentForm />
        }
        {route === 2 &&
          <Listing />
        }
      </Elements>
    </div>
  );
}

export default App;
