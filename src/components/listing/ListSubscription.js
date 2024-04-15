import { faSpinner } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import axios from "axios"
import React, { useEffect, useState } from "react"
import { Table } from "react-bootstrap"
import { env } from "../../env"
import { formatDateTime, formatInterval, formatMontant, getFrenchMonthName } from "../utils"
function ListSubscription({ codeClient }) {
    const [subscriptions, setSubscriptions] = useState([])
    const [expandedRow, setExpandedRow] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [subscriptionDetail, setSubscriptionDetail] = useState(null)
    const [pastInvoices, setPastInvoices] = useState([])
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
    const handleRowClickSubscription = (index, idStripe) => {
        setIsLoading(true)
        setExpandedRow(expandedRow === index ? null : index)
        axios.get(env.URL + 'subscription/stripe/' + idStripe).then((res) => {
            console.log(res)
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
    useEffect(() => {
        getSubscriptions(codeClient)
    }, [codeClient])
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
                                        <td style={{ color: subscription.status === 'active' ? 'green' : 'red' }}>{subscription.status}</td>
                                    </tr>
                                    {expandedRow === index &&
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: 'left', padding: 20 }}>
                                                {isLoading ?
                                                    <FontAwesomeIcon icon={faSpinner} pulse style={{ color: 'gray', width: '100%' }} size='xl' />
                                                    :
                                                    <>
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
                                                                            <th>Status</th>
                                                                            <th>Méthode de paiemet</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {pastInvoices.map((invoice) => (
                                                                            <tr key={invoice.id}>
                                                                                <td>{(new Date(invoice.created * 1000).toLocaleDateString())}</td>
                                                                                <td>{formatMontant(invoice.amount_due)} €</td>
                                                                                <td>{invoice.payment_intent.status === 'succeeded' ? 'Payé' : 'Impayé'}</td>
                                                                                {invoice.payment_intent.card ? <td>{invoice.payment_intent.card.last4}</td> : <td>Défaut</td>}
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
                </div>
                :
                <div className='empty-text'>Aucune abonnement enregistrée</div>
            }
        </>
    )
}
export default ListSubscription