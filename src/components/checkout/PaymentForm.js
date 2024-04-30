import React, { useEffect, useState } from 'react'
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js'
import './PaymentForm.css'
import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsRotate, faCheckCircle, faCreditCard, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Button, Form, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { faCcVisa, faCcAmex, faCcMastercard } from '@fortawesome/free-brands-svg-icons'
import { env } from '../../env'
import { clients, articles, subscriptions, coupons, companies } from '../../Dummy'
import OrderForm from './CommandeForm'
import { formatMontant } from '../utils/utils'
import SubscriptionForm from './SubscriptionForm'

const PaymentForm = () => {
    const stripe = useStripe()
    const elements = useElements()
    //choose client
    const [client, setClient] = useState(clients[0])
    //for order form
    const [nomSociete, setNomsociete] = useState(companies[0])

    const [montant, setMontant] = useState(0)

    //loading and return
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [succeeded, setSucceeded] = useState(null)
    const [loadingStatus, setLoadingStatus] = useState(null)
    //switching forms
    const [formValue, setFormValue] = useState(1)
    //for cards
    const [card, setCard] = useState(null)
    const [cards, setCards] = useState([])
    const [showCardInput, setShowCardInput] = useState(false)
    const [getCustomerDisabled, setGetCustomerDisabled] = useState(true)
    const [isCardNumberFilled, setCardNumberFilled] = useState(false)
    const [isCardExpiryFilled, setCardExpiryFilled] = useState(false)
    const [isCardCvcFilled, setCardCvcFilled] = useState(false)
    const [saveNewCard, setSaveNewCard] = useState(true)
    const [setAsDefaultCard, setSetASDefaultCartd] = useState(false)
    const [cardDefault, setCardDefault] = useState(null)

    //saved payment
    const [paymentIntent, setPaymentIntent] = useState(null)

    //for subscriptions
    const [paymentDay, setPaymentDay] = useState()
    const [paymentMonth, setPaymentMonth] = useState()
    const [interval, setInterval] = useState()
    const [invervalCount, setIntervalCount] = useState(1)


    const handleCardNumberChange = (event) => {
        setCardNumberFilled(event.complete)
    }
    const handleCardExpiryChange = (event) => {
        setCardExpiryFilled(event.complete)
    }
    const handleCardCvcChange = (event) => {
        setCardCvcFilled(event.complete)
    }
    const handleSubmit = async (event) => {
        setError(null)
        setSucceeded(null)
        var stop = false
        event.preventDefault()

        //check forms
        if (!stripe || !elements) {
            return
        }


        /*  if (
             (formValue === 1 && (codeArticle === '' || nomSociete === '' || client.code_client === '' || montant === ''))
             ||
             (formValue === 2 && (codeContrat === '' || !interval || (interval === 'year' && (!paymentMonth || !paymentDay)) || (interval === 'month' && !paymentDay) || montant === ''))
         ) {
             setError('Veuillez saisir tous les informations')
             return
         } */

        if (!card && (!isCardNumberFilled || !isCardExpiryFilled || !isCardCvcFilled)) {
            setError("Veuillez choisir une methode de paiement ou bien saisir la nouvelle carte.")
            return
        }
        //get card from elements
        const cardElement = elements.getElement(CardNumberElement)
        //chosing card
        var chosenPaymentMethod
        if (!card) {
            //add new card
            /* console.log("adding new card") */
            try {
                const newPaymentMethod = await stripe.createPaymentMethod({
                    type: 'card',
                    card: cardElement,
                    /*  billing_details: {
                         name: 'Jenny Rosen',
                         email:'',
                     }, */
                })
                /* console.log(newPaymentMethod) */
                chosenPaymentMethod = newPaymentMethod.paymentMethod.id
                /* console.log(chosenPaymentMethod) */
                const params = {
                    codeClient: client.code_client,
                    paymentMethod: chosenPaymentMethod
                }
                //save card
                if (saveNewCard) {
                    await axios.post(env.URL + 'customer', params).then((res) => {
                        /* console.log("res axios attach payment: ", res) */
                    }).catch((err) => {
                        /* console.log("error axios attach payment: ", err) */
                        if (err.response.data.message) {
                            if (err.response.data.message === 'STRIPE_ERROR_card_declined') {
                                setError("La carte a été refusée")
                                setIsLoading(false)
                            } else if (err.response.data.message === 'STRIPE_ERROR_incorrect_cvc') {
                                setError("Code cryptogramme visuel incorrect")
                                setIsLoading(false)
                            } else if (err.response.data.message === 'STRIPE_ERROR_processing_error') {
                                setError("Une erreur s'est produite lors du traitement de la carte")
                                setIsLoading(false)
                            } else if (err.response.data.message === 'STRIPE_ERROR_incorrect_number') {
                                setError("Numéro de la carte est incorrect")
                                setIsLoading(false)
                            } else {
                                setError(err.response.data.message)
                                setIsLoading(false)
                            }
                        }
                        stop = true
                    })
                }
            } catch (error) {
                console.log(error)
                return
            }
        } else {
            //chose existed card
            chosenPaymentMethod = card
        }
        if (stop) {
            return
        }
        //set card as default
        if (setAsDefaultCard || formValue === 2) {
            /* console.log('setting card as default') */
            await axios.post(env.URL + 'customer/update-default-pm', {
                paymentMethod: chosenPaymentMethod,
                customer: client.code_client
            }).then((res) => {
                /*  console.log(res)
                 console.log('setting card as default done') */
            }).catch((err) => {
                console.log(err)
            })
        }
        setIsLoading(true)
        //1 time payment 
        if (formValue === 1) {
            /* console.log('payment processing') */
            const paymentItentData = {
                nomSociete: nomSociete,
                /* codeArticle: codeArticle, */
                montant: montant * 100,
                codeClient: client.code_client,
            }
            //recheck payment if already created
            if (paymentIntent) {
                setLoadingStatus("Verifying payment method...")
                confirmPayment(paymentIntent, chosenPaymentMethod)
            } else {
                setLoadingStatus("Creating payment...")
                //create payment
                await axios.post(env.URL + 'commande/create', {
                    paymentItentData
                }).then(async (res) => {
                    /* console.log('create payment intent res: ', res) */
                    setPaymentIntent(res.data.paymentData)
                    setLoadingStatus("Verifying payment method...")
                    //confirm payment
                    confirmPayment(res.data.paymentData, chosenPaymentMethod)
                }).catch((error) => {
                    console.log(error)
                    setIsLoading(false)
                })
            }
        }
        //subscription
        if (formValue === 2) {
            //create price
            const priceData = {
                amount: montant * 100,
                interval: interval,
                interval_count: invervalCount
            }
            /* console.log('creating price', priceData) */

            setLoadingStatus("Creating price...")

            await axios.post(env.URL + 'subscription/price', priceData).then(async (res) => {
                /* console.log('create price res: ', res) */
                if (res.data.data) {
                    //create subscription
                    const subscriptionData = {
                        codeClient: client.code_client,
                        price: res.data.data,
                        payment_method: chosenPaymentMethod,
                        paymentDate: interval === 'week' ? null : parseInt(paymentDay),
                        paymentMonth: (interval === 'week' || interval === 'month') ? null : parseInt(paymentMonth)
                    }

                    setLoadingStatus("Creating subscription...")
                    axios.post(env.URL + 'subscription/create', subscriptionData).then(async (res) => {
                        /* console.log('create subscription res: ', res) */
                        if (res.data.data.status === 'active') {
                            setSucceeded("Abonnement activé")
                            setIsLoading(false)
                        } else {
                            setError("Abonnement incomplete")
                            setIsLoading(false)
                        }

                    }).catch((error) => {
                        console.log(error)
                        setError("Abonnement incomplete: " + error.response.data.message)
                        setIsLoading(false)
                    })
                }

            }).catch((error) => {
                console.log(error)
                setIsLoading(false)
            })
        }
    }

    async function confirmPayment(paymentIntent, paymentMethod) {
        stripe.confirmCardPayment(paymentIntent.clientSecret, {
            payment_method: paymentMethod
        })
            .then(function (res) {
                if (res.paymentIntent) {
                    if (res.paymentIntent.status === 'succeeded') {
                        //ridirect
                        setSucceeded("Paiement réussit")
                        setPaymentIntent(null)
                    }
                }
                if (res.error) {
                    if (res.error.code === 'incorrect_cvc') {
                        setError("Code cryptogramme visuel est incorrect.")
                        //code générale information incorrects

                    }
                    if (res.error.code === 'card_declined') {
                        setError("Paiement refusé. Réessayer ou choisir une autre carte.")
                    }
                    if (res.error.code === 'payment_intent_authentication_failure') {
                        setError('Paiement refusé. Authentification échouée.')
                    }
                }
                setIsLoading(false)
            })
    }
    useEffect(() => {
        if (client !== '') {
            setGetCustomerDisabled(false)
        }
    }, [client])

    function getPaymentMethod() {
        axios.get(env.URL + 'customer/' + client.code_client).then((res) => {
            /*  console.log(res) */
            setCards(res.data.entity)
            if (res.data.entity.length > 0) {
                const findCardDefault = res.data.entity.filter(card => card.default === true)
                if (findCardDefault) {
                    setCardDefault(findCardDefault[0].id)
                } else {
                    setCardDefault(null)
                }
            }
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
    useEffect(() => {
        const defaultCard = cards.find(card => card.default === true)
        if (defaultCard) {
            setCard(defaultCard.id)
        }
    }, [cards])

    //caculate total amount 

    return (
        <Form onSubmit={handleSubmit}>

            {isLoading ?
                (<div style={{ padding: 20 }}>

                    {loadingStatus && <div style={{ color: 'blue', marginBottom: 20 }}>{loadingStatus}</div>}
                    <div><FontAwesomeIcon icon={faSpinner} size='2xl' spin /></div>
                </div>)
                :
                (<>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBlock: 20 }}>
                        <div style={{ width: '100%', paddingInline: 50, }}>
                            <div style={{ display: 'flex', justifyContent: '', alignItems: 'center' }}>
                                <label style={{ width: '100%' }}>
                                    Select client:
                                    <Form.Select name="client" onChange={(e) => { setClient(e.target.value) }} value={client}>
                                        {clients.map((client, i) => {
                                            return (
                                                <option value={client} key={i}>{client.name}</option>
                                            )
                                        })}
                                    </Form.Select>
                                </label>

                                <Button variant="success" onClick={() => getPaymentMethod()} disabled={getCustomerDisabled} style={{ height: 'fit-content', display: 'flex', marginTop: '15px' }}>
                                    <div className='button'><FontAwesomeIcon icon={faArrowsRotate} /></div>
                                </Button>
                            </div>
                            <ToggleButtonGroup type="radio" value={formValue} name="formToggle" onChange={(value) => setFormValue(value)} style={{ marginTop: 20 }}>
                                <ToggleButton id="tbg-btn-1" variant="light" value={1}>
                                    <span style={{ color: "#2C3E50", fontWeight: 600, fontSize: formValue === 1 ? 18 : 14 }}>Acheter des articles</span>
                                </ToggleButton>
                                <ToggleButton id="tbg-btn-2" variant="light" value={2}>
                                    <span style={{ color: "#2C3E50", fontWeight: 600, fontSize: formValue === 1 ? 14 : 18 }}>Souscription</span>
                                </ToggleButton>
                            </ToggleButtonGroup>
                            <div style={{ paddingBlock: 10 }}>
                                {formValue === 1 &&
                                    <OrderForm
                                        articles={articles}
                                        companies={companies}
                                        nomSociete={nomSociete}
                                        setNomsociete={setNomsociete}
                                        montant={montant}
                                        setMontant={setMontant}
                                    />
                                }
                                {formValue === 2 &&
                                    <SubscriptionForm
                                        subscriptions={subscriptions}
                                        paymentDay={paymentDay}
                                        setPaymentDay={setPaymentDay}
                                        paymentMonth={paymentMonth}
                                        setPaymentMonth={setPaymentMonth}
                                        interval={interval}
                                        setInterval={setInterval}
                                        invervalCount={invervalCount}
                                        setIntervalCount={setIntervalCount}
                                        montant={montant}
                                        setMontant={setMontant}
                                    />
                                }
                            </div>

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

                                        <div onClick={() => newCard()} className='new-card-button'>Payer avec une nouvelle card</div>
                                    </>

                                }

                                {(showCardInput || cards.length === 0) &&
                                    <div style={{
                                        boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19)",
                                        padding: 20,
                                        borderRadius: 5,
                                        width: '100%'
                                    }}>
                                        <div style={{ padding: 20 }}>
                                            <div className='card-detail-title'>N° de la carte</div>
                                            <div className='card-element' style={{ marginBottom: '20px' }}>
                                                <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                                    <div style={{ width: '80%' }}>
                                                        <CardNumberElement
                                                            options={{ showIcon: true, placeholder: '1234 5678 9012 3456' }}
                                                            onChange={handleCardNumberChange}
                                                        />
                                                    </div>
                                                    {isCardNumberFilled && <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#45a049", width: '10%' }} />}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                                <div>
                                                    <div className='card-detail-title'>Date d'expiration </div>
                                                    <div className='card-element'>
                                                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                                            <div style={{ width: '80%' }}>
                                                                <CardExpiryElement onChange={handleCardExpiryChange} />
                                                            </div>
                                                            {isCardExpiryFilled && <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#45a049", width: '20%' }} />}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className='card-detail-title'>Cryptogramme visuel</div>
                                                    <div className='card-element'>
                                                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                                            <div style={{ width: '80%' }}>
                                                                <CardCvcElement options={{ placeholder: '123' }} onChange={handleCardCvcChange} />
                                                            </div>
                                                            {isCardCvcFilled && <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#45a049", width: '20%' }} />}

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='check-box-save-card' onClick={() => setSaveNewCard(saveNewCard ? false : true)}>
                                            <Form.Check
                                                type="checkbox"
                                                checked={saveNewCard}
                                                onChange={() => setSaveNewCard(saveNewCard ? false : true)}
                                                style={{ marginRight: 10 }}
                                            />

                                            Enregistrer cette carte pour vos prochains paiements
                                        </div>

                                    </div>
                                }
                            </div>

                        </div>
                    </div>

                    {(!cardDefault || (cardDefault && cardDefault !== card)) && <div className='check-box-save-card' onClick={() => setSetASDefaultCartd(setAsDefaultCard ? false : true)}>
                        <Form.Check
                            type="checkbox"
                            checked={formValue === 2 || setAsDefaultCard}
                            onChange={() => setSetASDefaultCartd(setAsDefaultCard ? false : true)}
                            style={{ marginRight: 10 }}
                        />
                        Définir cette carte comme méthode de paiement par défaut
                    </div>
                    }
                    <Button type="submit" variant="success" style={{ cursor: 'pointer', minWidth: '150px', height: 40, margin: 0 }}  >
                        {formValue === 1 ?
                            <>Payer </>
                            :
                            <>Abonner</>
                        }
                    </Button>
                </>)
            }
            {error && <div style={{ color: 'red', marginBlock: 10 }}>{error}</div>}
            {succeeded && <div style={{ color: 'green', marginBlock: 10 }}>{succeeded}</div>}
        </Form >
    )
}

export default PaymentForm
