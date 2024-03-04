import React, { useEffect, useState } from 'react'
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js'
import './PaymentForm.css'
import { env } from '../env'
import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsRotate, faCreditCard, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Button, Form } from 'react-bootstrap'
import { faCcVisa, faCcAmex, faCcMastercard } from '@fortawesome/free-brands-svg-icons'

const PaymentForm = ({ handlePayment }) => {
    const codeClientdefault = 'ABCD1234'
    const stripe = useStripe()
    const elements = useElements()
    const [nomSociete, setNomsociete] = useState('HTL')
    const [codeArticle, setCodeArticle] = useState('ABC123')
    const [montant, setMontant] = useState('10.10')
    const [codeClient, setCodeClient] = useState(codeClientdefault)
    const [billingName, setBillingName] = useState('Son-Tung PHAM')
    const [billingEmail, setBillingEmail] = useState('rominage.115@gmail.com')
    const [billingTel, setBillingTel] = useState('+33 7 58 58 58 58')
    const [billingAdresseCity, setBillingAdresseCity] = useState('Paris')
    const [billingAdresseCountry, setBillingAdresseCountry] = useState('France')
    const [billingAdresseLine2, setBillingAdresseLine2] = useState('')
    const [billingAdresseLine1, setBillingAdresseLine1] = useState('1  rue de Charenton')
    const [billingAdresseCP, setBillingAdresseCP] = useState('75012')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [succeeded, setSucceeded] = useState(null)
    const [loadingStatus, setLoadingStatus] = useState(null)
    const [card, setCard] = useState(null)
    const [cards, setCards] = useState([])
    const [showCardInput, setShowCardInput] = useState(false)
    const [getCustomerDisabled, setGetCustomerDisabled] = useState(true)
    const [isCardNumberFilled, setCardNumberFilled] = useState(false);
    const [isCardExpiryFilled, setCardExpiryFilled] = useState(false);
    const [isCardCvcFilled, setCardCvcFilled] = useState(false);

    const handleCardNumberChange = (event) => {
        setCardNumberFilled(event.complete);
    };

    const handleCardExpiryChange = (event) => {
        setCardExpiryFilled(event.complete);
    };

    const handleCardCvcChange = (event) => {
        setCardCvcFilled(event.complete);
    };

    const handleSubmitv2 = async (event) => {
        event.preventDefault()
        const customerData = {
            codeClient: codeClient,
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
        //create customer
        axios.post(env.URL + 'customer', {
            customerData
        }).then(async (res) => {
            console.log('new res:  ', res)
            //create payment method
            const cardElement = elements.getElement(CardNumberElement)
            const paymentMethodResponse = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            })
            console.log("paymentMethodResponse", paymentMethodResponse)
            const paymentMethodId = paymentMethodResponse.paymentMethod.id
            const customerId = res.data.entity.id
            const card = {
                brand: paymentMethodResponse.paymentMethod.card.brand,
                exp_month: paymentMethodResponse.paymentMethod.card.exp_month,
                exp_year: paymentMethodResponse.paymentMethod.card.exp_year,
                lastFour: paymentMethodResponse.paymentMethod.card.last4
            }
            //attach payment method
            await axios.post(env.URL + 'payment-method', { paymentMethodId, customerId, card })

        }).catch((error) => {
            console.log(error)
        })

    }
    const handleSubmitv3 = async (event) => {
        event.preventDefault();
        const paymentData = {
            nomSociete: nomSociete,
            codeArticle: codeArticle,
            montant: montant * 100,
            codeClient: codeClient
        }
        const customerData = {
            codeClient: codeClient,
            name: billingName,
            email: billingEmail,
            phone: billingTel,
            address: {
                city: billingAdresseCity,
                country: billingAdresseCountry === 'France' ? 'fr' : undefined,
                line1: billingAdresseLine1,
                line2: billingAdresseLine2 || null,
                postal_code: billingAdresseCP,
                state: null
            }
        };

        try {
            // Create customer
            const customerResponse = await axios.post(env.URL + 'customer', { customerData })
            console.log('New customer: ', customerResponse.data)

            // Create payment method
            const cardElement = elements.getElement(CardNumberElement)
            const paymentMethodCreate = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            })

            console.log("PaymentMethodResponse", paymentMethodCreate)

            const paymentMethodId = paymentMethodCreate.paymentMethod.id
            const customerId = customerResponse.data.entity.id

            const card = {
                brand: paymentMethodCreate.paymentMethod.card.brand,
                exp_month: paymentMethodCreate.paymentMethod.card.exp_month,
                exp_year: paymentMethodCreate.paymentMethod.card.exp_year,
                lastFour: paymentMethodCreate.paymentMethod.card.last4
            }

            // Attach payment method
            axios.post(env.URL + 'payment-method', { paymentMethodId, customerId, card }).then((res) => {
                console.log(res)
            }).catch((err) => {
                console.log(err.response.data.message)

            })
            return
            //create payment intent
            /*  const choosenMethod = paymentMethodAttach.data.entity.id
             const createPayment = await axios.post(env.URL + 'payments/create', { paymentData, customerId, choosenMethod })
             console.log("createPayment: ", createPayment) */

        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleSubmit = async (event) => {
        setError(null)
        setSucceeded(null)
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
        const paymentData = {
            nomSociete: nomSociete,
            codeArticle: codeArticle,
            montant: montant * 100,
            codeClient: codeClient,
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
                            setError("Code cryptogramme visuel est incorrect.")
                        }
                        if (res.error.code === 'card_declined') {
                            setError("Paiement refusé. Réessayer ou choisir une autre carte.")
                        }
                        if (res.error.code === 'payment_intent_authentication_failure') {
                            setError('Paiement refusé. Authentification échouée.')
                        }
                    }
                    if (res.paymentIntent) {
                        if (res.paymentIntent.status === 'succeeded') {
                            //ridirect
                            setSucceeded("Paiement réussit")
                        }
                    }

                }).catch(err => {
                    console.log(err)
                })
            })
        } catch (error) {
            console.error('Error during payment confirmation:', error)
            setError('Payment failed. Please try again.')
        }
    }
    const handleSubmitv4 = async (event) => {
        setError(null)
        setSucceeded(null)
        setIsLoading(true)
        event.preventDefault()
        if (codeArticle == '' || nomSociete == '' || codeClient == '' || montant == '') {
            setIsLoading(false)
            setError('Veuillez saisir tous les informations')
            return
        }
        const cardElement = elements.getElement(CardNumberElement)
        console.log("cardElement: ", cardElement)

        if (!card && (!isCardNumberFilled || !isCardExpiryFilled || !isCardCvcFilled)) {
            setIsLoading(false)
            setError("Veuillez choisir une methode de paiement ou bien saisir la nouvelle carte.")
        }

        const paymentItentData = {
            nomSociete: nomSociete,
            codeArticle: codeArticle,
            montant: montant * 100,
            codeClient: codeClient,
        }
        setLoadingStatus("Creating payment...")
        axios.post(env.URL + 'payments/create', {
            paymentItentData
        }).then((res) => {
            console.log(res)
            console.log('choosen card: ', card)
            if (card) {
                setLoadingStatus("Verifying payment method...")
                //to complete
            } else {
                setLoadingStatus("Creating payment method...")
                //to complete

            }
        }).catch((error) => {
            console.log(error)
            setIsLoading(false)
        })

    }

    useEffect(() => {
        if (codeClient !== '') {
            setGetCustomerDisabled(false)
        }
    }, [codeClient])

    function getPaymentMethod() {
        axios.get(env.URL + 'customer/' + codeClient).then((res) => {
            console.log(res.data.entity)
            setCards(res.data.entity)
        }).catch((err) => {
            console.log(err)
        })
    }

    function chooseCard(cardId) {
        setShowCardInput(false)
        setCard(cardId)
    }

    function newCard() {
        setShowCardInput(true)
        setCard(null)
    }
    return (
        <form onSubmit={handleSubmitv4}>

            {isLoading ?
                <div style={{ padding: 20 }}>

                    {loadingStatus && <div style={{ color: 'blue', marginBottom: 20 }}>{loadingStatus}</div>}
                    <div className='button-is-loading'><FontAwesomeIcon icon={faSpinner} size='xl' /></div>
                </div>
                :
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBlock: 20 }}>
                        <div style={{ width: '100%', paddingInline: 50 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                                <label>
                                    Code client:
                                    <input type="text" name="codeClient" value={codeClient} onChange={(e) => { setCodeClient(e.target.value) }} />
                                </label>

                                <Button variant="success" onClick={() => getPaymentMethod()} disabled={getCustomerDisabled} style={{ height: 'fit-content', display: 'flex' }}>
                                    <div className='button'><FontAwesomeIcon icon={faArrowsRotate} /></div>
                                </Button>
                            </div>


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

                            {/* CB */}
                            <div>
                                <label>
                                    Mode de paiement (CB)
                                </label>
                                {cards.length > 0 &&
                                    <>
                                        {cards.map((item, i) => {
                                            const getIconByBrand = (brand) => {
                                                switch (brand) {
                                                    case 'visa':
                                                        return faCcVisa
                                                    case 'mastercard':
                                                        return faCcMastercard
                                                    case 'american_express':
                                                        return faCcAmex
                                                    // Add more cases for other card brands if needed
                                                    default:
                                                        return faCreditCard
                                                }
                                            }
                                            return (
                                                <div className={card === item.id ? 'credit-card-item choosen' : 'credit-card-item'} key={i} onClick={() => chooseCard(item.id)}>
                                                    <FontAwesomeIcon icon={getIconByBrand(item.display_brand)} size='xl' className='card-brand' />
                                                    <div className='card-last4'>**** **** **** {item.last4}</div>
                                                    <div className='card-exp'>{item.exp_month}/{String(item.exp_year).slice(-2)}</div>
                                                </div>
                                            )
                                        })}

                                        <div onClick={() => newCard()} className='new-card-button'>Ou ajouter une nouvelle card</div>
                                    </>

                                }

                                {(showCardInput || cards.length === 0) &&
                                    <div style={{
                                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                        padding: 20,
                                        borderRadius: 5
                                    }}>
                                        <div className='card-detail-title'>N° de la carte</div>
                                        <div className='card-element' style={{ marginBottom: '20px' }}>
                                            <CardNumberElement
                                                options={{ showIcon: true, placeholder: '1234 5678 9012 3456' }}
                                                onChange={handleCardNumberChange}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div>
                                                <div className='card-detail-title'>Date d'expiration</div>
                                                <div className='card-element'>
                                                    <CardExpiryElement onChange={handleCardExpiryChange} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className='card-detail-title'>Cryptogramme visuel</div>
                                                <div className='card-element'>
                                                    <CardCvcElement options={{ placeholder: '123' }} onChange={handleCardCvcChange} />
                                                </div>
                                            </div>
                                        </div>
                                        {isCardNumberFilled && isCardExpiryFilled && isCardCvcFilled && (
                                            // Render additional content or enable a submit button
                                            <div>Your card details are filled!</div>
                                        )}
                                    </div>
                                }
                            </div>

                        </div>
                        {/* facture */}
                        {/*   <div style={{ width: '100%', paddingInline: 50, borderLeft: '1px solid #c4c4c4' }}>
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
                </div> */}
                    </div>

                    <button type="submit" style={{ cursor: 'pointer', minWidth: '150px', height: 40, marginTop: 50 }}  >
                        Payer {montant > 0 && montant + ' €'}
                    </button>
                </>
            }
            {error && <div style={{ color: 'red', marginBlock: 10 }}>{error}</div>}
            {succeeded && <div style={{ color: 'green', marginBlock: 10 }}>{succeeded}</div>}
        </form >
    )
}

export default PaymentForm
