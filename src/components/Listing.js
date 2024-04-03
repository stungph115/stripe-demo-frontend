import { faArrowsRotate, faCreditCard, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Button, Form, Table } from 'react-bootstrap'
import { env } from '../env'
import { faCcAmex, faCcMastercard, faCcVisa } from '@fortawesome/free-brands-svg-icons'
import './Listing.css'

function Listing() {
    const codeClientdefault = 'ABCD1234'
    const [codeClient, setCodeClient] = useState(codeClientdefault)
    const [getCustomerDisabled, setGetCustomerDisabled] = useState(true)
    const [subRoute, setSubRoute] = useState(1)
    const [cards, setCards] = useState([])
    const [cardDefault, setCardDefault] = useState(null)
    const [showCardInput, setShowCardInput] = useState(false)
    const [subscriptions, setSubscriptions] = useState([])
    const [payments, setPayments] = useState([])
    const [expandedRow, setExpandedRow] = useState(null)
    const [paymentDetail, setPaymentDetail] = useState(null)

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
    function getSubscriptions(codeClient) { }
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
                                    <div className={'credit-card-item'} key={i} style={{ width: '100%' }}>
                                        <FontAwesomeIcon icon={getIconByBrand(item.display_brand)} style={{ width: '10%' }} size='xl' className='card-brand' />
                                        <div className='card-last4' style={{ width: '40%' }}>**** **** **** {item.last4}</div>
                                        <div className='card-exp' style={{ width: '10%' }}>{item.exp_month > 9 ? item.exp_month : '0' + item.exp_month}/{String(item.exp_year).slice(-2)}</div>
                                        {item.id === cardDefault ?
                                            <div style={{ paddingInline: 10, width: '40%' }}>défaut</div>
                                            :
                                            <div className="set-default-text" style={{ paddingInline: 10, width: '40%' }}>définir par défaut</div>
                                        }
                                        <div className='card-delete'><FontAwesomeIcon icon={faTrash} /></div>
                                    </div>
                                )
                            })}

                        </>
                        :
                        <div className='empty-text'>Aucune méthode de paiement enregistrée</div>
                    }
                    <div onClick={() => setShowCardInput(true)} className='new-card-button'>Ou ajouter une nouvelle carte</div>
                </>
            }
            {subRoute === 2 &&
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
            {subRoute === 3 &&
                <>
                    {subscriptions.length > 0 ?
                        <></>
                        :
                        <div className='empty-text'>Aucune abonnement enregistrée</div>
                    }
                </>
            }
        </div>
    )
}
export default Listing
