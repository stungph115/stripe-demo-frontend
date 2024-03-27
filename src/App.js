import './App.css';
import PaymentForm from './components/PaymentForm';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { env } from './env';
const stripePromise = loadStripe(env.PUBLIC_KEY_STRIPE);

function App() {
  return (
    <div className="App">
      <h1 style={{ padding: 20 }}>Stripe Payment Demo</h1>
      <Elements stripe={stripePromise}>
        <PaymentForm />
      </Elements>
    </div>
  );
}

export default App;
