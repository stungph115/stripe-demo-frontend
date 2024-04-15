import './App.css';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { env } from './env';
import { useState } from 'react';
import Listing from './components/listing/Listing';
import Admin from './components/admin/Admin';
import PaymentForm from './components/checkout/PaymentForm';
const stripePromise = loadStripe(env.PUBLIC_KEY_STRIPE);

function App() {
  const [route, setRoute] = useState(1)

  return (
    <div className="App">
      <h1 style={{ padding: 20 }}>Stripe Payment Demo</h1>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div onClick={() => setRoute(1)} className={route === 1 ? 'route choosen' : 'route'} style={{ paddingInline: 20 }}>Check out</div>
        <div onClick={() => setRoute(2)} className={route === 2 ? 'route choosen' : 'route'} style={{ paddingInline: 20 }}>Listing</div>
        <div onClick={() => setRoute(3)} className={route === 3 ? 'route choosen' : 'route'} style={{ paddingInline: 20 }}>Admin</div>
      </div>
      <Elements stripe={stripePromise}>
        {route === 1 &&
          <PaymentForm />
        }
        {route === 2 &&
          <Listing />
        }
        {route === 3 &&
          <Admin />
        }
      </Elements>
    </div>
  );
}

export default App;
