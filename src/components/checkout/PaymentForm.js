import React, { useEffect, useState } from 'react'
import { useStripe } from '@stripe/react-stripe-js'
import './PaymentForm.css'
import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Button, Form, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { env } from '../../env'
import { clients, companies } from '../../Dummy'
import OrderForm from './CommandeForm'
import SubscriptionForm from './SubscriptionForm'
import ListCard from '../listing/ListCard'

const PaymentForm = () => {
    const stripe = useStripe()
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
    const [disabledSubmit, setDisableSubmit] = useState(true)
    //switching forms
    const [formValue, setFormValue] = useState(1)
    //for cards
    const [selectedCard, setSelectedCard] = useState(null)
    //saved payment
    const [paymentIntent, setPaymentIntent] = useState(null)

    //for subscriptions
    const [paymentDay, setPaymentDay] = useState(1)
    const [paymentMonth, setPaymentMonth] = useState(1)
    const [chosenSubscription, setChosenSubscription] = useState(null)
    console.log("chosenSubscription", chosenSubscription)
    const handleSubmit = async (event) => {
        setError(null)
        setSucceeded(null)
        var stop = false
        event.preventDefault()

        //check forms
        if (!stripe) {
            return
        }

        setIsLoading(true)
        //1 time payment 
        if (formValue === 1) {
            /* console.log('payment processing') */
            const paymentItentData = {
                nomSociete: nomSociete,
                montant: montant,
                codeClient: client.codeClient,
            }
            //recheck payment if already created
            if (paymentIntent) {
                setLoadingStatus("Verifying payment method...")
                confirmPayment(paymentIntent, selectedCard.id)
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
                    confirmPayment(res.data.paymentData, selectedCard.id)
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
                name: chosenSubscription.name,
                amount: chosenSubscription.price,
                interval: chosenSubscription.recurring.interval,
                interval_count: chosenSubscription.recurring.interval_count
            }
            /* console.log('creating price', priceData) */

            setLoadingStatus("Creating price...")

            await axios.post(env.URL + 'subscription/price', priceData).then(async (res) => {
                /* console.log('create price res: ', res) */
                if (res.data.data) {
                    //create subscription
                    const subscriptionData = {
                        codeClient: client.codeClient,
                        price: res.data.data,
                        payment_method: selectedCard,
                        paymentDate: priceData.interval === 'week' ? null : parseInt(paymentDay),
                        paymentMonth: (priceData.interval === 'week' || priceData.interval === 'month') ? null : parseInt(paymentMonth)
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

    //verfying before submit
    useEffect(() => {
        if (!client || !selectedCard) {
            setDisableSubmit(true)
        } else {
            if (formValue === 1) {
                if (montant === 0 || !nomSociete) {
                    setDisableSubmit(true)
                } else {
                    setDisableSubmit(false)
                }
            }
            if (formValue === 2) {
                if (!chosenSubscription || !paymentDay || !paymentMonth) {
                    setDisableSubmit(true)
                } else {
                    setDisableSubmit(false)
                }
            }
        }

    }, [client, selectedCard, montant, formValue, nomSociete, chosenSubscription, paymentDay, paymentMonth])

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
                                    <Form.Select name="client" onChange={(e) => { setClient(clients.find(client => client.codeClient === e.target.value)) }} value={client.codeClient} style={{ width: '100%' }}>
                                        {clients.map((client, i) => {
                                            return (
                                                <option value={client.codeClient} key={i}>{client.name}</option>
                                            )
                                        })}
                                    </Form.Select>
                                </label>
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
                                        nomSociete={nomSociete}
                                        setNomsociete={setNomsociete}
                                        montant={montant}
                                        setMontant={setMontant}
                                    />
                                }
                                {formValue === 2 &&
                                    <SubscriptionForm
                                        chosenSubscription={chosenSubscription}
                                        setChosenSubscription={setChosenSubscription}
                                        paymentDay={paymentDay}
                                        setPaymentDay={setPaymentDay}
                                        paymentMonth={paymentMonth}
                                        setPaymentMonth={setPaymentMonth}
                                    />
                                }
                            </div>
                            <label style={{ width: '100%' }}>
                                Mode de paiement (CB):
                                <div style={{ paddingBlock: 10 }}>
                                    <ListCard client={client} selectedCard={selectedCard} setSelectedCard={setSelectedCard} />

                                </div>

                            </label>
                        </div>
                    </div>
                    <Button type="submit" variant="success" style={{ cursor: 'pointer', minWidth: '150px', height: 40, margin: 0 }} disabled={disabledSubmit}>
                        {isLoading ?
                            <FontAwesomeIcon icon={faSpinner} pulse style={{ color: 'gray', width: '100%', paddingBlock: 50 }} size='xl' />
                            :
                            <>{formValue === 1 ? 'Payer' : 'Abonner'}</>
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
