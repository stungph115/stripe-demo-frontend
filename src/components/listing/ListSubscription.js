import { faCircleCheck, faCirclePause, faClock, faSpinner, faTriangleExclamation, faXmarkCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import axios from "axios"
import React, { useEffect, useState } from "react"
import { Button, Modal, Table } from "react-bootstrap"
import { env } from "../../env"
import { formatDateTime, formatInterval, formatMontant, getFrenchMonthName, getIconByBrand } from "../utils/utils"
import ListCard from "./ListCard"
import { useStripe } from "@stripe/react-stripe-js"
import socket from "../utils/socket"

function ListSubscription({ codeClient }) {
    const stripe = useStripe()
    const [subscriptions, setSubscriptions] = useState([])
    const [expandedRow, setExpandedRow] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingList, setIsLoadingList] = useState(false)
    const [subscriptionDetail, setSubscriptionDetail] = useState(null)
    const [pastInvoices, setPastInvoices] = useState([])
    const [subscription, setSubscription] = useState(null)
    /* console.log("subscriptions", subscriptions)
    console.log("subscriptionDetail", subscriptionDetail) */
    async function getSubscriptions(codeClient) {
        setIsLoadingList(true)
        axios.get(env.URL + 'subscription/' + codeClient).then((res) => {
            if (res.data) {
                setSubscriptions(res.data)
            } else {
                setSubscriptions([])
            }
            setIsLoadingList(false)

        }).catch((err) => {
            setIsLoadingList(false)
            console.log(err)
        })
    }
    const handleRowClickSubscription = (index, idStripe) => {
        setSubscription(idStripe)
        setExpandedRow(expandedRow === index ? null : index)
        getSubscriptionDetail(idStripe)
    }
    useEffect(() => {
        getSubscriptions(codeClient)
    }, [codeClient])
    function getSubscriptionDetail(idStripe) {
        setIsLoading(true)
        axios.get(env.URL + 'subscription/stripe/' + idStripe).then((res) => {
            console.log('res', res)
            setSubscriptionDetail(res.data)
            if (res.data.pastInvoices) {
                setPastInvoices(res.data.pastInvoices)
            }
            setIsLoading(false)
        }).catch((err) => {
            setIsLoading(false)
            console.log(err)
        })
    }
    //update card for payment failed

    const [showCardList, setShowCardList] = useState(false)
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
    const [error, setError] = useState(null)
    const [submitDisable, setSubmitDisable] = useState(false)
    const [selectedCard, setSelectedCard] = useState(null)
    const [paymentIntent, setPaymentIntent] = useState(null)

    useEffect(() => {
        if (selectedCard) {
            setSubmitDisable(false)
        } else {
            setSubmitDisable(true)
        }
    }, [selectedCard])
    function handleUnpaidInvoice(payment) {
        setPaymentIntent(payment)
        setShowCardList(true)
    }

    async function updatePayment() {
        setError(null)
        setIsLoadingSubmit(true)
        stripe.confirmCardPayment(paymentIntent, {
            payment_method: selectedCard.id
        }).then(function (res) {
            if (res.paymentIntent) {
                if (res.paymentIntent.status === 'succeeded') {
                    setShowCardList(false)
                    setIsLoadingSubmit(false)
                }
            }
            if (res.error) {
                setIsLoadingSubmit(false)
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
        })
    }
    useEffect(() => {
        socket.on('SUBSCRIPTION_UPDATED', () => {
            getSubscriptions(codeClient)
        })
        return () => {
            socket.off('SUBSCRIPTION_UPDATED')
        }
    }, [])
    useEffect(() => {
        if (subscription) {
            getSubscriptionDetail(subscription)
        }
    }, [subscriptions])

    if (isLoadingList) {
        return (
            <FontAwesomeIcon icon={faSpinner} pulse style={{ color: 'gray', width: '100%', paddingBlock: 50 }} size='xl' />
        )
    } else {
        return (
            <>
                {subscriptions.length > 0 ?
                    <div style={{ padding: 20 }}>
                        <Table striped bordered hover >
                            <thead>
                                <tr>
                                    <th className="p-3">Code contrat</th>
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
                                        <tr onClick={() => handleRowClickSubscription(index, subscription.stripId)} style={{ cursor: 'pointer' }}>
                                            <td>{subscription.code_contrat}</td>
                                            <td>{formatInterval(subscription.interval)}</td>
                                            <td>{subscription.interval_count}</td>
                                            <td>{formatMontant(subscription.montant)} €</td>
                                            <td>{formatDateTime(subscription.dateCreated)}</td>
                                            <td>{formatDateTime(subscription.dateUpdated)}</td>
                                            {(subscription.status === 'incomplete_expired' || subscription.status === 'canceled' || subscription.status === 'unpaid') &&
                                                <td style={{ color: 'red', fontWeight: 500 }}>Annulé</td>
                                            }
                                            {(subscription.status === 'active') &&
                                                <td style={{ color: 'green', fontWeight: 500 }}>Actif</td>
                                            }
                                            {(subscription.status === 'incomplete' || subscription.status === 'paused' || subscription.status === 'past_due') &&
                                                < td style={{ color: 'rgb(255 162 0)', fontWeight: 500 }}>En attente</td>
                                            }
                                        </tr>
                                        {expandedRow === index &&
                                            <tr>
                                                <td colSpan={7} style={{ textAlign: 'left', padding: 20 }}>
                                                    {isLoading ?
                                                        <FontAwesomeIcon icon={faSpinner} pulse style={{ color: 'gray', width: '100%' }} size='xl' />
                                                        :
                                                        <>
                                                            {subscriptionDetail && !subscriptionDetail.nextBillingDate && (subscription.status === 'incomplete_expired' || subscription.status === 'canceled' || subscription.status === 'unpaid') &&
                                                                <div style={{ color: 'red', padding: 5, fontSize: 16 }}>
                                                                    <FontAwesomeIcon icon={faTriangleExclamation} />  Cet abonnement a été annulé

                                                                </div>
                                                            }
                                                            <div style={{ display: 'flex' }}>
                                                                <div><strong>Méthode de paiement:</strong></div>
                                                                <div style={{ marginLeft: 5 }}>
                                                                    Défaut
                                                                </div>
                                                            </div>
                                                            {subscriptionDetail && subscriptionDetail.billing_cycle_anchor &&
                                                                <div style={{ display: 'flex' }}>
                                                                    <div><strong>Cycle de Facturation:</strong></div>
                                                                    <div style={{ marginLeft: 5 }}>
                                                                        {new Date(subscriptionDetail.billing_cycle_anchor * 1000).toLocaleString()}
                                                                    </div>
                                                                </div>
                                                            }
                                                            {subscriptionDetail && subscriptionDetail.billing_cycle_anchor_config &&
                                                                <div style={{ display: 'flex' }}>
                                                                    <div><strong>Date de facturation choisi:</strong></div>
                                                                    <div style={{ marginLeft: 5 }}>
                                                                        {subscriptionDetail.billing_cycle_anchor_config.day_of_month && subscriptionDetail.billing_cycle_anchor_config.month &&
                                                                            <>Le {subscriptionDetail.billing_cycle_anchor_config.day_of_month} {getFrenchMonthName(subscriptionDetail.billing_cycle_anchor_config.month)} de chaque année</>
                                                                        }
                                                                        {subscriptionDetail.billing_cycle_anchor_config.day_of_month && !subscriptionDetail.billing_cycle_anchor_config.month &&
                                                                            <>Tous les {subscriptionDetail.billing_cycle_anchor_config.day_of_month === 1 ? '1er' : subscriptionDetail.billing_cycle_anchor_config.day_of_month + 'ème'} jour de chaque mois</>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            }
                                                            {subscriptionDetail && subscriptionDetail.nextBillingDate &&
                                                                <div style={{ display: 'flex' }}>
                                                                    <div><strong>Prochain date de facturation:</strong></div>
                                                                    <div style={{ marginLeft: 5 }}>
                                                                        {formatDateTime(subscriptionDetail.nextBillingDate)}
                                                                    </div>
                                                                </div>
                                                            }
                                                            <strong>Dernières facturations:</strong>
                                                            {pastInvoices &&
                                                                <div style={{ padding: 10 }}>
                                                                    <Table >
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Date</th>
                                                                                <th>Montant</th>
                                                                                <th>Méthode de paiement</th>
                                                                                <th>Status</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {pastInvoices.map((invoice) => (
                                                                                <tr key={invoice.id}>
                                                                                    <td>{formatDateTime(invoice.created * 1000)} </td>
                                                                                    <td>{formatMontant(invoice.amount_due)} €</td>
                                                                                    {invoice.status !== 'paid' && invoice.payment_intent.last_payment_error &&
                                                                                        <td> <div style={{ cursor: 'pointer' }} onClick={() => handleUnpaidInvoice(invoice.payment_intent.client_secret)}>

                                                                                            <FontAwesomeIcon icon={getIconByBrand(invoice.payment_intent.last_payment_error.payment_method.card.display_brand)} size='xl' className='card-brand' />
                                                                                            {invoice.payment_intent.last_payment_error.payment_method.card.display_brand} ***-<strong>{invoice.payment_intent.last_payment_error.payment_method.card.last4}</strong>
                                                                                            <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: "red", marginLeft: 5 }} />

                                                                                        </div></td>
                                                                                    }
                                                                                    {invoice.status === 'paid' && invoice.payment_intent.payment_method &&
                                                                                        <td>
                                                                                            <FontAwesomeIcon icon={getIconByBrand(invoice.payment_intent.payment_method.display_brand)} size='xl' className='card-brand' />
                                                                                            {invoice.payment_intent.payment_method.display_brand} ***-<strong>{invoice.payment_intent.payment_method.last4}</strong>
                                                                                        </td>
                                                                                    }
                                                                                    {invoice.status !== 'paid' && !invoice.payment_intent.last_payment_error &&
                                                                                        <td>
                                                                                            Non-défini
                                                                                        </td>
                                                                                    }
                                                                                    <td>
                                                                                        {invoice.status === 'draft' &&
                                                                                            <div className="payment-status">
                                                                                                <div style={{ color: 'gray', padding: 5 }}>À venir</div>
                                                                                                <FontAwesomeIcon icon={faClock} style={{ color: 'gray' }} />
                                                                                            </div>
                                                                                        }
                                                                                        {invoice.status === 'open' &&
                                                                                            <div className="payment-status">
                                                                                                <div style={{ color: 'gray', padding: 5 }}>En attente de paiement</div>
                                                                                                <FontAwesomeIcon icon={faCirclePause} style={{ color: 'gray' }} />
                                                                                            </div>
                                                                                        }
                                                                                        {invoice.status === 'paid' &&
                                                                                            <div className="payment-status">
                                                                                                <div style={{ color: 'green', padding: 5 }}>Payé</div>
                                                                                                <FontAwesomeIcon icon={faCircleCheck} style={{ color: 'green' }} />
                                                                                            </div>
                                                                                        }
                                                                                        {(invoice.status === 'void' || invoice.status === 'uncollectible') &&
                                                                                            <div className="payment-status">
                                                                                                <div style={{ color: 'red', padding: 5 }}>Annulé</div>
                                                                                                <FontAwesomeIcon icon={faXmarkCircle} style={{ color: 'red' }} />
                                                                                            </div>
                                                                                        }
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </Table>
                                                                </div>
                                                            }
                                                        </>
                                                    }
                                                </td>
                                            </tr>
                                        }
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </Table>
                    </div >
                    :
                    <div className='empty-text'>Aucune abonnement enregistrée</div>
                }
                <Modal size='lg' show={showCardList} onHide={() => setShowCardList(false)} centered>
                    <Modal.Header closeButton className="px-4">
                        <Modal.Title className="ms-auto"> Choisir une nouvelle méthode de paiement</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="d-flex justify-content-center align-items-center" >

                        {isLoadingSubmit ?
                            <div style={{ padding: 30 }}>
                                <div style={{ color: 'blue', marginBottom: 20 }}>En attente de confirmation de paiement</div>
                                <FontAwesomeIcon icon={faSpinner} pulse style={{ color: 'gray', width: '100%', paddingBlock: 20 }} size='2xl' />

                            </div>
                            :
                            <div style={{ width: '70%' }}>
                                <ListCard codeClient={codeClient} selectedCard={selectedCard} setSelectedCard={setSelectedCard} />
                                {error && <div style={{ color: 'red', marginBlock: 10 }}>{error}</div>}
                            </div>
                        }

                    </Modal.Body>
                    <Modal.Footer className="d-flex justify-content-center" >
                        <Button variant='danger' onClick={() => updatePayment()} disabled={submitDisable}>
                            {isLoadingSubmit ?
                                <FontAwesomeIcon icon={faSpinner} pulse style={{ color: 'white', width: '100%' }} size='xl' />
                                :
                                "Valider"
                            }
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
}
export default ListSubscription