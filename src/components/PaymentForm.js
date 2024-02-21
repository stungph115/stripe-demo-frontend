import React, { useState } from 'react';
import { CardElement, useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import './PaymentForm.css'
import { env } from '../env';
import axios from "axios"

const PaymentForm = ({ handlePayment }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [nomSociete, setNomsociete] = useState('')
    const [codeArticle, setCodeArticle] = useState('')
    const [refTransaction, setRefTransaction] = useState('')
    const [montant, setMontant] = useState()
    const [codeClient, setCodeClient] = useState('')
    const [holderName, setHolderName] = useState('')
    /* const handleInputChange = (e) => {
        const { name, value } = e.target;
        const formattedValue = parseFloat(value).toFixed(2);
        setPaymentInfo({ ...paymentInfo, [name]: formattedValue });
    }; */
    console.log(montant)
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardNumberElement)
        const paymentData = {
            nomSociete: nomSociete,
            codeArticle: codeArticle,
            refTransaction: refTransaction,
            montant: montant * 100,
            codeClient: codeClient
        }
        console.log(paymentData)
        try {
            axios.post(env.URL + 'payments/create', {
                paymentData
            }).then(res => {
                console.log("res axios post", res)
                return new Promise((resolve, reject) => {
                    stripe.createPaymentMethod({
                        type: 'card',
                        card: cardElement,
                        billing_details: {
                            name: holderName
                        }
                    }).then(paymentMethod => {
                        console.log("paymentMethod: ", paymentMethod)
                        const data = {
                            clientSecret: res.data.client_secret,
                            paymentMethodId: paymentMethod.paymentMethod.id
                        }
                        resolve(data)
                    }).catch(err => reject(err))
                }).then(res => {
                    console.log(res)
                    return stripe.confirmCardPayment(res.clientSecret, {
                        payment_method: res.paymentMethodId
                    })
                }).then(res => {
                    console.log(res)
                }).catch(err => {
                    console.log(err)
                })
            })

        } catch (error) {
            console.error('Error during payment confirmation:', error);
            setError('Payment failed. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Nom de la société:
                <input type="text" name="nomSociete" value={nomSociete} onChange={(e) => { setNomsociete(e.target.value) }} />
            </label>
            <label>
                Code d'article:
                <input type="text" name="codeArticle" value={codeArticle} onChange={(e) => { setCodeArticle(e.target.value) }} />
            </label>
            <label>
                Référence de transaction:
                <input type="text" name="refTransaction" value={refTransaction} onChange={(e) => { setRefTransaction(e.target.value) }} />
            </label>
            <label>
                Montant (en €):
                <input type="number" step="0.01" name="montant" value={montant /* + '€' */} onChange={(e) => { setMontant(e.target.value) }} />
            </label>
            <label>
                Code client:
                <input type="text" name="codeClient" value={codeClient} onChange={(e) => { setCodeClient(e.target.value) }} />
            </label>
            <label>
                Mode de paiement (CB)
            </label>
            <div style={{
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                padding: 20,
                borderRadius: 5
            }}>
                <div className='card-detail-title'>Nom du titulaire de la carte</div>
                <div style={{ marginBottom: '10px' }}>
                    <input type='text' placeholder='M. Jean DUPONT ' className='input-name-checkout' />
                </div>
                <div className='card-detail-title'>N° de la carte</div>
                <div className='card-element' style={{ marginBottom: '20px' }}>
                    <CardNumberElement options={{ showIcon: true, placeholder: '1234 5678 9012 3456' }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }} >
                    <div /* style={{ width: '40%' }} */>
                        <div className='card-detail-title'>Date d'expiration</div>
                        <div className='card-element'>
                            <CardExpiryElement />
                        </div>
                    </div>
                    <div /* style={{ width: '40%' }} */>
                        <div className='card-detail-title'>Cryptogramme visuel</div>
                        <div className='card-element' >
                            <CardCvcElement options={{ placeholder: '123' }} />
                        </div>
                    </div>

                </div>

            </div>


            <button type="submit" style={{ marginTop: 50 }}>Payer {montant > 0 && montant} €</button>
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
    );
};

export default PaymentForm;
