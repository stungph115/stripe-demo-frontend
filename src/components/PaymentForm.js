import React, { useState } from 'react'
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js'
import './PaymentForm.css'
import { env } from '../env'
import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

const PaymentForm = ({ handlePayment }) => {
    const stripe = useStripe()
    const elements = useElements()
    const [nomSociete, setNomsociete] = useState('HTL')
    const [codeArticle, setCodeArticle] = useState('ABC123')
    const [montant, setMontant] = useState('10.10')
    const [codeClient, setCodeClient] = useState('ABC123')
    const [billingName, setBillingName] = useState('Son-Tung PHAM')
    const [billingEmail, setBillingEmail] = useState('rominage.115@gmail.com')
    const [billingTel, setBillingTel] = useState('+33 7 58 58 58 58')
    const [billingAdresseCity, setBillingAdresseCity] = useState('Paris')
    const [billingAdresseCountry, setBillingAdresseCountry] = useState('France')
    const [billingAdresseLine2, setBillingAdresseLine2] = useState('')
    const [billingAdresseLine1, setBillingAdresseLine1] = useState('1  rue de Charenton')
    const [billingAdresseCP, setBillingAdresseCP] = useState('75012')
    const [payButtonDisabled, setPayButtonDisabled] = useState(false)
    const [error, setError] = useState(null)
    const [succeeded, setSucceeded] = useState(null)

    const handleSubmit = async (event) => {
        setError(null)
        setSucceeded(null)
        setPayButtonDisabled(true)
        event.preventDefault()
        if (!nomSociete || !codeArticle || !montant || !codeClient || !billingName || !billingEmail || !billingAdresseCP || !billingAdresseCity || !billingAdresseCountry || !billingAdresseLine1 || !billingTel) {
            setError('Veuillez sasir tous les informations obligatoires')
            return
        }
        console.log("submit")
        if (!stripe || !elements) {
            return
        }
        const cardElement = elements.getElement(CardNumberElement)
        /*   cardElement.on('change', function (event) {
              console.log("cardElement event", event)
              if (event.complete) {
                  // enable payment button
              } else if (event.error) {
                  // show validation to customer
                  setError("Veuillez saisir la carte")
                  return
              }
          }) */
        const paymentData = {
            nomSociete: nomSociete,
            codeArticle: codeArticle,
            montant: montant * 100,
            codeClient: codeClient
        }
        if (!cardElement) {
            return
        }
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
                            name: billingName,
                            email: billingEmail,
                            phone: billingTel,
                            address: {
                                city: billingAdresseCity,
                                country: billingAdresseCountry === 'France' && 'fr',
                                line1: billingAdresseLine1,
                                line2: billingAdresseLine2 !== '' ? billingAdresseLine2 : null,
                                postal_code: billingAdresseCP,
                                state: null
                            }
                        }
                    }).then(paymentMethod => {
                        console.log("paymentMethod: ", paymentMethod)
                        if (paymentMethod.error) {
                            console.log(paymentMethod.error)
                            if (paymentMethod.error.code === 'incomplete_number') {
                                setError('Veuillez saisir le numéro de la carte')
                            }
                            if (paymentMethod.error.code === 'invalid_number') {
                                setError('Le numéro de la carte est incorrect')
                            }
                            if (paymentMethod.error.code === 'incomplete_expiry') {
                                setError("Veuillez saisir la date d'expiration")
                            }
                            if (paymentMethod.error.code === 'incomplete_cvc') {
                                setError("Veuillez saisir le cryptogramme visuel")
                            }
                            setPayButtonDisabled(false)
                            return
                        }
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
                    if (res.error) {
                        if (res.error.code === 'incorrect_cvc') {
                            setError("Code cryptogramme visuel est incorrect")
                        }
                        if (res.error.code === 'card_declined') {
                            setError("Paiement refusé. Réessayer ou choisir une autre carte")
                        }
                    }
                    if (res.paymentIntent) {
                        if (res.paymentIntent.status === 'succeeded') {
                            //ridirect
                            setSucceeded("Paiement réussit")
                        }
                    }
                    setPayButtonDisabled(false)

                }).catch(err => {
                    console.log(err)
                    setPayButtonDisabled(false)
                })
            })
        } catch (error) {
            setPayButtonDisabled(false)
            console.error('Error during payment confirmation:', error)
            setError('Payment failed. Please try again.')
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBlock: 20 }}>
                <div style={{ width: '100%', padding: 50 }}>
                    <label>
                        Nom de la société:
                        <input type="text" name="nomSociete" value={nomSociete} onChange={(e) => { setNomsociete(e.target.value) }} />
                    </label>
                    <label>
                        Code d'article:
                        <input type="text" name="codeArticle" value={codeArticle} onChange={(e) => { setCodeArticle(e.target.value) }} />
                    </label>
                    <label>
                        Montant (en €):
                        <input type="number" step="0.01" name="montant" value={montant} onChange={(e) => { setMontant(e.target.value) }} />
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
                </div>
                <div style={{ width: '100%', paddingInline: 50, borderLeft: '1px solid #c4c4c4' }}>
                    <label style={{ marginTop: 30 }}>
                        Détail facturation
                    </label>
                    <div style={{
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        padding: 20,
                        borderRadius: 5,
                        marginBottom: 50
                    }}>
                        <div className='card-detail-title'>Nom et prénom*</div>
                        <div style={{ marginBottom: '10px' }}>
                            <input type='text' placeholder='Jean DUPONT ' className='input-name-checkout' onChange={(e) => { setBillingName(e.target.value) }} value={billingName} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ width: '50%' }}>
                                <div className='card-detail-title'>Adresse e-mail*</div>
                                <div style={{ marginBottom: '10px' }}>
                                    <input type='text' placeholder='exemple@mail.fr ' className='input-name-checkout' onChange={(e) => { setBillingEmail(e.target.value) }} value={billingEmail} />
                                </div>
                            </div>
                            <div style={{ width: '40%' }}>
                                <div className='card-detail-title'>N° téléphone*</div>
                                <div style={{ marginBottom: '10px' }}>
                                    <input type='text' placeholder='+33 7 58 58 58 58' className='input-name-checkout' onChange={(e) => { setBillingTel(e.target.value) }} value={billingTel} />
                                </div>
                            </div>
                        </div>
                        <div className='card-detail-title'> Adresse postal*</div>
                        <div>
                            <input type='text' placeholder='Ligne 1 (N° et nom de la voie)*' className='input-name-checkout' onChange={(e) => { setBillingAdresseLine1(e.target.value) }} value={billingAdresseLine1} />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <input type='text' placeholder='Ligne 2 (option)' className='input-name-checkout' onChange={(e) => { setBillingAdresseLine2(e.target.value) }} value={billingAdresseLine2} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ width: '30%' }}>
                                <div className='card-detail-title'> Code postal*</div>
                                <div>
                                    <input type='text' placeholder='75012' className='input-name-checkout' onChange={(e) => { setBillingAdresseCP(e.target.value) }} value={billingAdresseCP} />
                                </div>
                            </div>
                            <div style={{ width: '50%' }}>
                                <div className='card-detail-title'> Ville*</div>
                                <div>
                                    <input type='text' placeholder='Paris' className='input-name-checkout' onChange={(e) => { setBillingAdresseCity(e.target.value) }} value={billingAdresseCity} />
                                </div>
                            </div>

                        </div>

                        <div className='card-detail-title'> Pays*</div>
                        <div>
                            <input type='text' placeholder='France' className='input-name-checkout' onChange={(e) => { setBillingAdresseCountry(e.target.value) }} value={billingAdresseCountry} />
                        </div>

                    </div>
                </div>
            </div>



            {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
            {succeeded && <div style={{ color: 'green', marginBottom: 10 }}>{succeeded}</div>}
            <button type="submit" style={{ cursor: payButtonDisabled ? 'not-allowed' : 'pointer', minWidth: '150px', height: 40 }} disabled={payButtonDisabled} >
                {payButtonDisabled ?
                    <div className='button-is-loading'><FontAwesomeIcon icon={faSpinner} size='xl' /></div>
                    :
                    <> Payer {montant > 0 && montant + ' €'}</>
                }


            </button>

        </form>
    )
}

export default PaymentForm
