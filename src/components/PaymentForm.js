import React, { useEffect, useState } from 'react'
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js'
import './PaymentForm.css'
import { env } from '../env'
import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsRotate, faCheckCircle, faCreditCard, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Button, Form, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { faCcVisa, faCcAmex, faCcMastercard } from '@fortawesome/free-brands-svg-icons'

const PaymentForm = ({ handlePayment }) => {
    const codeClientdefault = 'ABCD1234'
    const stripe = useStripe()
    const elements = useElements()
    const [nomSociete, setNomsociete] = useState('HTL')
    const [codeArticle, setCodeArticle] = useState('ABC123')
    const [montant, setMontant] = useState('10.10')
    const [codeClient, setCodeClient] = useState(codeClientdefault)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [succeeded, setSucceeded] = useState(null)
    const [loadingStatus, setLoadingStatus] = useState(null)
    const [card, setCard] = useState(null)
    const [cards, setCards] = useState([])
    const [showCardInput, setShowCardInput] = useState(false)
    const [getCustomerDisabled, setGetCustomerDisabled] = useState(true)
    const [isCardNumberFilled, setCardNumberFilled] = useState(false)
    const [isCardExpiryFilled, setCardExpiryFilled] = useState(false)
    const [isCardCvcFilled, setCardCvcFilled] = useState(false)
    const [saveNewCard, setSaveNewCard] = useState(true)
    const [setAsDefaultCard, setSetASDefaultCartd] = useState(false)
    const [paymentIntent, setPaymentIntent] = useState(null)
    const [formValue, setFormValue] = useState(1)
    const [codeContrat, setCodecontrat] = useState('ABCD1234')
    const [interval, setInterval] = useState(['month', 'year', 'week', 'day'])
    const [paymentDate, setPaymentDate] = useState(null)
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
        if (!stripe || !elements) {
            return
        }
        if (codeArticle === '' || nomSociete === '' || codeClient === '' || montant === '') {
            setError('Veuillez saisir tous les informations')
            return
        }
        if (!card && (!isCardNumberFilled || !isCardExpiryFilled || !isCardCvcFilled)) {
            setError("Veuillez choisir une methode de paiement ou bien saisir la nouvelle carte.")
            return
        }
        const cardElement = elements.getElement(CardNumberElement)
        var chosenPaymentMethod
        if (!card) {
            try {
                const newPaymentMethod = await stripe.createPaymentMethod({
                    type: 'card',
                    card: cardElement,
                    /*  billing_details: {
                         name: 'Jenny Rosen',
                     }, */
                })
                chosenPaymentMethod = newPaymentMethod.paymentMethod.id
                if (saveNewCard) {
                    await axios.post(env.URL + 'customer', {
                        codeClient: codeClient,
                        paymentMethod: chosenPaymentMethod
                    }).then((res) => {
                        console.log("res axios attach payment: ", res)
                    }).catch((err) => {
                        console.log("error axios attach payment: ", err)
                        if (err.response.data.message) {
                            if (err.response.data.message === 'STRIPE_ERROR_card_declined') {
                                setError("La carte a été refusée")
                                setIsLoading(false)
                            } if (err.response.data.message === 'STRIPE_ERROR_incorrect_cvc') {
                                setError("Code cryptogramme visuel incorrect")
                                setIsLoading(false)
                            } if (err.response.data.message === 'STRIPE_ERROR_processing_error') {
                                setError("Une erreur s'est produite lors du traitement de la carte")
                                setIsLoading(false)
                            } if (err.response.data.message === 'STRIPE_ERROR_incorrect_number') {
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
            chosenPaymentMethod = card
        }
        if (stop) {
            return
        }
        console.log('choosen payment method: ', chosenPaymentMethod)
        if (setAsDefaultCard) {
            axios.post(env.URL + 'customer/update-default-pm', {
                paymentMethod: chosenPaymentMethod,
                custom: codeClient
            }).then((res) => {
                console.log(res)
            }).catch((err) => {
                console.log(err)
            })
        }
        setIsLoading(true)
        const paymentItentData = {
            nomSociete: nomSociete,
            codeArticle: codeArticle,
            montant: montant * 100,
            codeClient: codeClient,
        }
        if (paymentIntent) {
            setLoadingStatus("Verifying payment method...")
            confirmPayment(paymentIntent, chosenPaymentMethod)
        } else {
            setLoadingStatus("Creating payment...")
            await axios.post(env.URL + 'payments/create', {
                paymentItentData
            }).then(async (res) => {
                console.log('create payment intent res: ', res)
                setPaymentIntent(res.data.paymentData)
                setLoadingStatus("Verifying payment method...")
                confirmPayment(res.data.paymentData, chosenPaymentMethod)
            }).catch((error) => {
                console.log(error)
                setIsLoading(false)
            })

        }
    }

    async function confirmPayment(paymentIntent, paymentMethod) {
        console.log(paymentIntent, paymentMethod)
        stripe.confirmCardPayment(paymentIntent.clientSecret, {
            payment_method: paymentMethod
        })
            .then(function (res) {
                console.log("confirmPaymentv2 res: ", res)
                if (res.paymentIntent) {
                    if (res.paymentIntent.status === 'succeeded') {
                        //ridirect
                        setSucceeded("Paiement réussit")
                    }
                }
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
    useEffect(() => {
        console.log(cards)
        const defaultCard = cards.find(card => card.default === true)
        if (defaultCard) {
            setCard(defaultCard.id)
        }
    }, [cards])
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
                                    Code client:
                                    <input type="text" name="codeClient" value={codeClient} onChange={(e) => { setCodeClient(e.target.value) }} />
                                </label>

                                <Button variant="success" onClick={() => getPaymentMethod()} disabled={getCustomerDisabled} style={{ height: 'fit-content', display: 'flex' }}>
                                    <div className='button'><FontAwesomeIcon icon={faArrowsRotate} /></div>
                                </Button>
                            </div>
                            <ToggleButtonGroup type="radio" value={formValue} name="formToggle" onChange={(value) => setFormValue(value)} style={{}}>
                                <ToggleButton id="tbg-btn-1" variant="light" value={1}>
                                    <span style={{ color: "#2C3E50", fontWeight: 600, fontSize: formValue === 1 ? 18 : 14 }}>Paiement une fois</span>
                                </ToggleButton>
                                <ToggleButton id="tbg-btn-2" variant="light" value={2}>
                                    <span style={{ color: "#2C3E50", fontWeight: 600, fontSize: formValue === 1 ? 14 : 18 }}>Abonnement</span>
                                </ToggleButton>
                            </ToggleButtonGroup>

                            {formValue === 1 &&
                                <>
                                    <div>
                                        <label style={{ width: '100%' }}>
                                            Nom de la société:
                                            <input type="text" name="nomSociete" value={nomSociete} onChange={(e) => { setNomsociete(e.target.value) }} />
                                        </label >
                                    </div>
                                    <div>
                                        <label style={{ width: '100%' }}>
                                            Code d'article:
                                            <input type="text" name="codeArticle" value={codeArticle} onChange={(e) => { setCodeArticle(e.target.value) }} />
                                        </label>
                                    </div>
                                </>

                            }
                            {formValue === 2 &&
                                <>
                                    <div>
                                        <label style={{ width: '100%' }}>
                                            Code contrat:
                                            <input type="text" name="codecontrat" value={codeContrat} onChange={(e) => { setCodecontrat(e.target.value) }} />
                                        </label>
                                    </div>
                                    <div>
                                        <label style={{ width: '100%' }}>
                                            Code contrat:
                                            <input type="text" name="codecontrat" value={codeContrat} onChange={(e) => { setCodecontrat(e.target.value) }} />
                                        </label>
                                    </div>
                                    <div>
                                        <label style={{ width: '100%' }}>
                                            Code contrat:
                                            <input type="text" name="codecontrat" value={codeContrat} onChange={(e) => { setCodecontrat(e.target.value) }} />
                                        </label>
                                    </div>
                                </>

                            }

                            <label style={{ width: '100%' }}>
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
                                            />

                                            Enregistrer cette carte pour vos prochains paiements
                                        </div>

                                    </div>
                                }
                            </div>

                        </div>
                    </div>

                    <div className='check-box-save-card' style={{ justifyContent: 'space-evenly' }} onClick={() => setSetASDefaultCartd(setAsDefaultCard ? false : true)}>
                        <Form.Check
                            type="checkbox"
                            checked={setAsDefaultCard}
                            onChange={() => setSetASDefaultCartd(setAsDefaultCard ? false : true)}
                        />

                        Définir cette carte comme méthode de paiement par défaut
                    </div>

                    <button type="submit" style={{ cursor: 'pointer', minWidth: '150px', height: 40, margin: 0 }}  >
                        Payer {montant > 0 && montant + ' €'}
                    </button>
                </>)
            }
            {error && <div style={{ color: 'red', marginBlock: 10 }}>{error}</div>}
            {succeeded && <div style={{ color: 'green', marginBlock: 10 }}>{succeeded}</div>}
        </Form >
    )
}

export default PaymentForm
