import axios from "axios"
import React, { useEffect, useState } from "react"
import { env } from "../../env"
import { Button, Modal, Table } from "react-bootstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPen, faSpinner } from "@fortawesome/free-solid-svg-icons"
import { formatDateTime, getIconByBrand, formatMontant } from "../utils"
import ListCard from "./ListCard"
function ListPayment({ codeClient }) {
    const [paymentDetail, setPaymentDetail] = useState(null)
    const [payments, setPayments] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [expandedRow, setExpandedRow] = useState(null)
    const [showCardList, setShowCardList] = useState(false)
    const [selectedCard, setSelectedCard] = useState(null)
    const handleRowClickPayment = (index, idStripe) => {
        setIsLoading(true)
        setExpandedRow(expandedRow === index ? null : index)
        axios.get(env.URL + 'payments/stripe/' + idStripe).then((res) => {
            console.log(res)
            setPaymentDetail(res.data)
            setIsLoading(false)
        }).catch((err) => {
            setIsLoading(false)
            console.log(err)
        })
    }

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
    useEffect(() => {
        getPayments(codeClient)
    }, [codeClient])
    function updatePayment() {
        //finish
    }
    return (
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
                                    <tr onClick={() => handleRowClickPayment(index, payment.stripId)} style={{ cursor: 'pointer' }}>
                                        <td>{payment.company}</td>
                                        <td>{payment.code_article}</td>
                                        <td>{formatMontant(payment.montant)} €</td>
                                        <td>{formatDateTime(payment.dateCreated)}</td>
                                        <td>{formatDateTime(payment.dateUpdated)}</td>
                                        <td style={{ color: payment.status === 'paid' ? 'green' : 'red' }}>{payment.status === 'paid' ? 'payé' : 'impayé'}</td>
                                    </tr>
                                    {expandedRow === index &&
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'left', padding: 20 }}>
                                                {isLoading ?
                                                    <FontAwesomeIcon icon={faSpinner} pulse style={{ color: 'gray', width: '100%' }} size='xl' />
                                                    :
                                                    <>
                                                        {paymentDetail && paymentDetail.last_payment_error &&
                                                            <>
                                                                <div> <strong>Decline code: </strong> {paymentDetail.last_payment_error.decline_code}</div>
                                                                <div style={{ display: "flex", alignItems: 'center' }}>
                                                                    <strong> Méthode de paiement utilisée: </strong>
                                                                    <div className='credit-card-item' style={{ width: 'fit-content', marginLeft: 10 }}>
                                                                        <FontAwesomeIcon icon={getIconByBrand(paymentDetail.last_payment_error.payment_method.card.display_brand)} size='xl' className='card-brand' />
                                                                        <div className='card-last4' >**** **** **** {paymentDetail.last_payment_error.payment_method.card.last4}</div>
                                                                        <div className='card-exp' >{paymentDetail.last_payment_error.payment_method.card.exp_month > 9 ? paymentDetail.last_payment_error.payment_method.card.exp_month : '0' + paymentDetail.last_payment_error.payment_method.card.exp_month}/{String(paymentDetail.last_payment_error.payment_method.card.exp_year).slice(-2)}</div>
                                                                    </div>
                                                                    <Button onClick={() => setShowCardList(true)}><FontAwesomeIcon icon={faPen} size='sm' /></Button>
                                                                </div>

                                                            </>
                                                        }
                                                        {paymentDetail && paymentDetail.status === 'succeeded' &&
                                                            <div style={{ display: "flex", alignItems: 'center' }}>
                                                                <strong> Méthode de paiemnt ustilisé: </strong>
                                                                <div className='credit-card-item' style={{ width: 'fit-content', marginLeft: 10 }}>

                                                                    <FontAwesomeIcon icon={getIconByBrand(paymentDetail.payment_method.card.display_brand)} size='xl' className='card-brand' />
                                                                    <div className='card-last4' >**** **** **** {paymentDetail.payment_method.card.last4}</div>
                                                                    <div className='card-exp' >{paymentDetail.payment_method.card.exp_month > 9 ? paymentDetail.payment_method.card.exp_month : '0' + paymentDetail.payment_method.card.exp_month}/{String(paymentDetail.payment_method.card.exp_year).slice(-2)}</div>
                                                                </div>
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
                <div className='empty-text'>Aucune paiement enregistrée</div>
            }
            <Modal size='lg' show={showCardList} onHide={() => setShowCardList(false)} centered>
                <Modal.Header closeButton className="px-4">
                    <Modal.Title className="ms-auto"> Changer méthode de paiement</Modal.Title>
                </Modal.Header>
                <Modal.Body className=" justify-content-center align-items-center" >
                    <ListCard codeClient={codeClient} selectedCard={selectedCard} setSelectedCard={setSelectedCard} />
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-center" >
                    <Button variant='danger' onClick={() => updatePayment()} >
                        {isLoading ?
                            <FontAwesomeIcon icon={faSpinner} pulse />
                            :
                            "Valider"
                        }
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
export default ListPayment