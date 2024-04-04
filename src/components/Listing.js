import { faArrowsRotate, faCheckCircle, faCreditCard, faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Button, Form, Modal, Table } from 'react-bootstrap'
import { env } from '../env'
import { faCcAmex, faCcMastercard, faCcVisa } from '@fortawesome/free-brands-svg-icons'
import './Listing.css'
import { CardCvcElement, CardExpiryElement, CardNumberElement, useStripe, useElements } from '@stripe/react-stripe-js'

function Listing() {
    const stripe = useStripe()
    const elements = useElements()
    const codeClientdefault = 'ABCD1234'
    const [codeClient, setCodeClient] = useState(codeClientdefault)
    const [getCustomerDisabled, setGetCustomerDisabled] = useState(true)
    const [subRoute, setSubRoute] = useState(1)
    const [cards, setCards] = useState([])
    const [cardDefault, setCardDefault] = useState(null)
    const [showCardInput, setShowCardInput] = useState(false)
    const [showDeteleCard, setShowDeteleCard] = useState(false)
    const [subscriptions, setSubscriptions] = useState([])
    const [payments, setPayments] = useState([])
    const [expandedRow, setExpandedRow] = useState(null)
    const [paymentDetail, setPaymentDetail] = useState(null)
    const [isCardNumberFilled, setCardNumberFilled] = useState(false)
    const [isCardExpiryFilled, setCardExpiryFilled] = useState(false)
    const [isCardCvcFilled, setCardCvcFilled] = useState(false)
    const [disabledAddCard, setDisabledAddCard] = useState(true)
    const [disabledDeleteCard, setDisabledDeleteCard] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [setAsDefaultCard, setSetAsDefaultCard] = useState(false)
    console.log(subscriptions)
    useEffect(() => {
        if (codeClient !== '') {
            setGetCustomerDisabled(false)
        }
    }, [codeClient])

    function getPayments(codeClient) {
        axios.get(env.URL + 'payments/' + codeClient).then((res) => {
            if (res.data) {
                setPayments(res.data)
            } else {
                setPayments([])
            }

        }).catch((err) => {
            console.log(err)
        })
    }
    function getSubscriptions(codeClient) {
        axios.get(env.URL + 'subscription/' + codeClient).then((res) => {
            if (res.data) {
                setSubscriptions(res.data)
            } else {
                setSubscriptions([])
            }

        }).catch((err) => {
            console.log(err)
        })
    }
    useEffect(() => {
        switch (subRoute) {
            case 1:
                getPaymentMethods(codeClient)
                break
            case 2:
                getPayments(codeClient)
                break
            case 3:
                getSubscriptions(codeClient)
                break
        }

    }, [subRoute, codeClient])

    function getPaymentMethods(codeClient) {

        axios.get(env.URL + 'customer/' + codeClient).then((res) => {
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

    const formatDateTime = (dateTimeString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        return new Date(dateTimeString).toLocaleString('fr-FR', options)
    }

    const formatMontant = (montant) => {
        const formattedMontant = montant.toString().replace(/(\d)(?=(\d{2})+(?!\d))/g, '$1,')
        return formattedMontant
    }
    const formatInterval = (interval) => {
        switch (interval) {
            case 'week':
                return 'semaine'
            case 'month':
                return 'mois'
            case 'year':
                return 'année'
        }

    }

    const handleRowClick = (index, idStripe) => {
        setExpandedRow(expandedRow === index ? null : index)
        axios.get(env.URL + 'payments/stripe/' + idStripe).then((res) => {
            console.log(res)
            setPaymentDetail(res.data)
        }).catch((err) => {
            console.log(err)
        })
    }
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
    const handleCardNumberChange = (event) => {
        setCardNumberFilled(event.complete)
    }
    const handleCardExpiryChange = (event) => {
        setCardExpiryFilled(event.complete)
    }
    const handleCardCvcChange = (event) => {
        setCardCvcFilled(event.complete)
    }

    useEffect(() => {
        if (isCardNumberFilled && isCardExpiryFilled && isCardCvcFilled) {
            setDisabledAddCard(false)
        } else {
            setDisabledAddCard(true)
        }
    }, [isCardNumberFilled, isCardExpiryFilled, isCardCvcFilled])
    useEffect(() => {
        if (isLoading) {
            setDisabledAddCard(true)
            setDisabledDeleteCard(true)
        } else {
            setDisabledAddCard(false)
            setDisabledDeleteCard(false)
        }
    }, [isLoading])

    async function addCard() {
        var stop = false
        setIsLoading(true)
        setError(null)
        const cardElement = elements.getElement(CardNumberElement)
        try {
            const newPaymentMethod = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                /*  billing_details: {
                     name: 'Jenny Rosen',
                     email:'',
                 }, */
            })
            const params = {
                codeClient: codeClient,
                paymentMethod: newPaymentMethod.paymentMethod.id
            }
            await axios.post(env.URL + 'customer', params).then((res) => {
                console.log("res axios attach payment: ", res)
                if (res.data.statusCode === 200) {
                    if (setAsDefaultCard) {
                        setDefaultCard(newPaymentMethod.paymentMethod.id)
                    }
                    setShowCardInput(false)
                    getPaymentMethods(codeClient)
                    setIsLoading(false)
                }
            }).catch((err) => {
                console.log("error axios attach payment: ", err)
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
        } catch (err) {
            console.log(err)
            setIsLoading(false)
            return
        }
        if (stop) {
            setIsLoading(false)
            return
        }
    }
    async function setDefaultCard(paymentMethod) {
        setIsLoading(true)
        axios.post(env.URL + 'customer/update-default-pm', {
            paymentMethod: paymentMethod,
            custom: codeClient
        }).then((res) => {
            console.log(res)
            console.log('setting card as default done')
            getPaymentMethods(codeClient)
            setIsLoading(false)
        }).catch((err) => {
            setIsLoading(false)
            console.log(err)
        })
        return true
    }
    async function deleteCard(paymentMethod) {
        setIsLoading(true)
        axios.delete(env.URL + 'customer/' + paymentMethod).then((res) => {
            console.log(res)
            getPaymentMethods(codeClient)
            setIsLoading(false)
            setShowDeteleCard(false)
        }).catch((err) => {
            console.log(err)
            setIsLoading(false)
        })
    }
    return (
        <div className='listing'>

            <div className='client-input'>
                <label style={{ width: '100%' }}>
                    Code client:
                    <Form.Control type="text" name="codeClient" value={codeClient} onChange={(e) => { setCodeClient(e.target.value) }} />
                </label>

            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div onClick={() => setSubRoute(1)} className={subRoute === 1 ? 'sub-route choosen' : 'sub-route'}>Méthode de paiement</div>
                <div onClick={() => setSubRoute(2)} className={subRoute === 2 ? 'sub-route choosen' : 'sub-route'}>Mes paiement</div>
                <div onClick={() => setSubRoute(3)} className={subRoute === 3 ? 'sub-route choosen' : 'sub-route'}>Mes subscription</div>
            </div>
            {subRoute === 1 &&
                <>
                    {cards.length > 0 ?
                        <>
                            {cards.map((item, i) => {

                                return (
                                    <>
                                        <div className={'credit-card-item'} key={i} style={{ width: '100%' }}>
                                            <FontAwesomeIcon icon={getIconByBrand(item.display_brand)} style={{ width: '10%' }} size='xl' className='card-brand' />
                                            <div className='card-last4' style={{ width: '40%' }}>**** **** **** {item.last4}</div>
                                            <div className='card-exp' style={{ width: '10%' }}>{item.exp_month > 9 ? item.exp_month : '0' + item.exp_month}/{String(item.exp_year).slice(-2)}</div>
                                            {item.id === cardDefault ?
                                                <div style={{ paddingInline: 10, width: '40%' }}>défaut</div>
                                                :
                                                <div className="set-default-text" style={{ paddingInline: 10, width: '40%' }} onClick={() => setDefaultCard(item.id)}>
                                                    {isLoading ?
                                                        <FontAwesomeIcon icon={faSpinner} pulse />
                                                        :
                                                        'définir par défaut'
                                                    }
                                                </div>
                                            }
                                            <div className='card-delete' onClick={() => setShowDeteleCard(true)}><FontAwesomeIcon icon={faTrash} /></div>

                                        </div>
                                        <Modal size='xl' show={showDeteleCard} onHide={() => setShowDeteleCard(false)} centered>
                                            <Modal.Header closeButton className="px-4">
                                                <Modal.Title className="ms-auto"> Suppression d'une carte</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body className="d-flex justify-content-center align-items-center" >
                                                Voulez-vous retirer cette carte ?
                                                <div className={'credit-card-item'} key={i} style={{ width: '100%' }}>
                                                    <FontAwesomeIcon icon={getIconByBrand(item.display_brand)} style={{ width: '10%' }} size='xl' className='card-brand' />
                                                    <div className='card-last4' style={{ width: '40%' }}>**** **** **** {item.last4}</div>
                                                    <div className='card-exp' style={{ width: '10%' }}>{item.exp_month > 9 ? item.exp_month : '0' + item.exp_month}/{String(item.exp_year).slice(-2)}</div>
                                                </div>

                                            </Modal.Body>
                                            <Modal.Footer className="d-flex justify-content-center" >
                                                <Button variant='danger' onClick={() => deleteCard(item.id)} disabled={disabledDeleteCard}>
                                                    {isLoading ?
                                                        <FontAwesomeIcon icon={faSpinner} pulse />
                                                        :
                                                        "Supprimer"
                                                    }
                                                </Button>
                                            </Modal.Footer>
                                        </Modal>
                                    </>

                                )
                            })}

                        </>
                        :
                        <div className='empty-text'>Aucune méthode de paiement enregistrée</div>
                    }
                    <div onClick={() => setShowCardInput(true)} className='new-card-button'>Ou ajouter une nouvelle carte</div>
                    <Modal size='xl' show={showCardInput} onHide={() => setShowCardInput(false)} centered>
                        <Modal.Header closeButton className="px-4">
                            <Modal.Title className="ms-auto"> Ajouter une carte</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="d-flex justify-content-center align-items-center" >
                            <div style={{
                                boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19)",
                                padding: 20,
                                margin: 20,
                                borderRadius: 5,
                                width: '50%',
                            }}>

                                < div style={{ padding: 20 }}>
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

                                {error && <div style={{ color: 'red', marginBlock: 10 }}>{error}</div>}
                                <div className='check-box-save-card' onClick={() => setSetAsDefaultCard(setAsDefaultCard ? false : true)}>
                                    <Form.Check
                                        type="checkbox"
                                        checked={setAsDefaultCard}
                                        onChange={() => setSetAsDefaultCard(setAsDefaultCard ? false : true)}
                                        style={{ marginRight: 10 }}
                                    />

                                    Définir cette carte comme méthode de paiement par défaut
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="d-flex justify-content-center" >
                            <Button variant='success' onClick={() => addCard()} disabled={disabledAddCard}>
                                {isLoading ?
                                    <FontAwesomeIcon icon={faSpinner} pulse />
                                    :
                                    "Ajouter"
                                }
                            </Button>
                        </Modal.Footer>
                    </Modal>

                </>
            }
            {
                subRoute === 2 &&
                <>
                    {payments.length > 0 ?
                        <div style={{ padding: 20 }}>
                            <Table striped bordered hover >
                                <thead>
                                    <tr>
                                        <th className="p-3">Company</th>
                                        <th className="p-3">Article Code</th>
                                        <th className="p-3">Montant</th>
                                        <th className="p-3">Date Created</th>
                                        <th className="p-3">Date Updated</th>
                                        <th className="p-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment, index) => (
                                        <React.Fragment key={index}>
                                            <tr onClick={() => handleRowClick(index, payment.stripId)} style={{ cursor: 'pointer' }}>
                                                <td>{payment.company}</td>
                                                <td>{payment.code_article}</td>
                                                <td>{formatMontant(payment.montant)} €</td>
                                                <td>{formatDateTime(payment.dateCreated)}</td>
                                                <td>{formatDateTime(payment.dateUpdated)}</td>
                                                <td style={{ color: payment.status === 'paid' ? 'green' : 'red' }}>{payment.status}</td>
                                            </tr>
                                            {expandedRow === index &&
                                                <tr>
                                                    <td colSpan={6} style={{ textAlign: 'left', padding: 20 }}>
                                                        {paymentDetail && paymentDetail.last_payment_error &&
                                                            <>
                                                                <div> <strong>Decline code: </strong> {paymentDetail.last_payment_error.decline_code}</div>
                                                                <div style={{ display: "flex", alignItems: 'center' }}>
                                                                    <strong> Méthode de paiemnt ustilisé: </strong>
                                                                    <div className='credit-card-item' style={{ width: 'fit-content' }}>
                                                                        <FontAwesomeIcon icon={getIconByBrand(paymentDetail.last_payment_error.payment_method.card.display_brand)} size='xl' className='card-brand' />
                                                                        <div className='card-last4' >**** **** **** {paymentDetail.last_payment_error.payment_method.card.last4}</div>
                                                                        <div className='card-exp' >{paymentDetail.last_payment_error.payment_method.card.exp_month > 9 ? paymentDetail.last_payment_error.payment_method.card.exp_month : '0' + paymentDetail.last_payment_error.payment_method.card.exp_month}/{String(paymentDetail.last_payment_error.payment_method.card.exp_year).slice(-2)}</div>
                                                                    </div>
                                                                </div>

                                                            </>
                                                        }
                                                        {paymentDetail && paymentDetail.status === 'succeeded' &&
                                                            <div style={{ display: "flex", alignItems: 'center' }}>
                                                                <strong> Méthode de paiemnt ustilisé: </strong>
                                                                <div className='credit-card-item' style={{ width: 'fit-content' }}>

                                                                    <FontAwesomeIcon icon={getIconByBrand(paymentDetail.payment_method.card.display_brand)} size='xl' className='card-brand' />
                                                                    <div className='card-last4' >**** **** **** {paymentDetail.payment_method.card.last4}</div>
                                                                    <div className='card-exp' >{paymentDetail.payment_method.card.exp_month > 9 ? paymentDetail.payment_method.card.exp_month : '0' + paymentDetail.payment_method.card.exp_month}/{String(paymentDetail.payment_method.card.exp_year).slice(-2)}</div>
                                                                </div>
                                                            </div>

                                                        }
                                                    </td>
                                                </tr>
                                            }
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                        :
                        <div className='empty-text'>Aucune paiement enregistrée</div>
                    }
                </>
            }
            {
                subRoute === 3 &&
                <>
                    {subscriptions.length > 0 ?
                        <div style={{ padding: 20 }}>
                            <Table striped bordered hover >
                                <thead>
                                    <tr>
                                        <th className="p-3">Codet contrat</th>
                                        <th className="p-3">Intervalle</th>
                                        <th className="p-3">Compte d'intervalle</th>
                                        <th className="p-3">Montant</th>
                                        <th className="p-3">Date Created</th>
                                        <th className="p-3">Date Updated</th>
                                        <th className="p-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscriptions.map((subscription, index) => (
                                        <React.Fragment key={index}>
                                            <tr onClick={() => handleRowClick(index, subscription.stripId)} style={{ cursor: 'pointer' }}>
                                                <td>{subscription.code_contrat}</td>
                                                <td>{formatInterval(subscription.interval)}</td>
                                                <td>{subscription.interval_count}</td>
                                                <td>{formatMontant(subscription.montant)} €</td>
                                                <td>{formatDateTime(subscription.dateCreated)}</td>
                                                <td>{formatDateTime(subscription.dateUpdated)}</td>
                                                <td style={{ color: subscription.status === 'active' ? 'green' : 'red' }}>{subscription.status}</td>
                                            </tr>
                                            {expandedRow === index &&
                                                <tr>
                                                    <td colSpan={6} style={{ textAlign: 'left', padding: 20 }}>
                                                        {/*  {paymentDetail && paymentDetail.last_payment_error &&
                                                            <>
                                                                <div> <strong>Decline code: </strong> {paymentDetail.last_payment_error.decline_code}</div>
                                                                <div style={{ display: "flex", alignItems: 'center' }}>
                                                                    <strong> Méthode de paiemnt ustilisé: </strong>
                                                                    <div className='credit-card-item' style={{ width: 'fit-content' }}>
                                                                        <FontAwesomeIcon icon={getIconByBrand(paymentDetail.last_payment_error.payment_method.card.display_brand)} size='xl' className='card-brand' />
                                                                        <div className='card-last4' >**** **** **** {paymentDetail.last_payment_error.payment_method.card.last4}</div>
                                                                        <div className='card-exp' >{paymentDetail.last_payment_error.payment_method.card.exp_month > 9 ? paymentDetail.last_payment_error.payment_method.card.exp_month : '0' + paymentDetail.last_payment_error.payment_method.card.exp_month}/{String(paymentDetail.last_payment_error.payment_method.card.exp_year).slice(-2)}</div>
                                                                    </div>
                                                                </div>

                                                            </>
                                                        }
                                                        {paymentDetail && paymentDetail.status === 'succeeded' &&
                                                            <div style={{ display: "flex", alignItems: 'center' }}>
                                                                <strong> Méthode de paiemnt ustilisé: </strong>
                                                                <div className='credit-card-item' style={{ width: 'fit-content' }}>

                                                                    <FontAwesomeIcon icon={getIconByBrand(paymentDetail.payment_method.card.display_brand)} size='xl' className='card-brand' />
                                                                    <div className='card-last4' >**** **** **** {paymentDetail.payment_method.card.last4}</div>
                                                                    <div className='card-exp' >{paymentDetail.payment_method.card.exp_month > 9 ? paymentDetail.payment_method.card.exp_month : '0' + paymentDetail.payment_method.card.exp_month}/{String(paymentDetail.payment_method.card.exp_year).slice(-2)}</div>
                                                                </div>
                                                            </div>

                                                        } */}
                                                    </td>
                                                </tr>
                                            }
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                        :
                        <div className='empty-text'>Aucune abonnement enregistrée</div>
                    }
                </>
            }
        </div >
    )
}
export default Listing
