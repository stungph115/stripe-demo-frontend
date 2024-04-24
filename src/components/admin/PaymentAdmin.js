import { faSpinner } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import axios from "axios"
import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { env } from "../../env"
import { Button, Table } from "react-bootstrap"
import { formatDateTime } from "../utils/utils"

function PaymentAdmin() {
    const idPayment = useParams().id
    const navigate = useNavigate()
    const [payments, setPayments] = useState([])
    const [payment, setPayment] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [paymentsPerPage] = useState(15)
    const [expandedRow, setExpandedRow] = useState(null)
    const [paymentDetail, setPaymentDetail] = useState(null)
    const [isLoadingList, setIsLoadingList] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    useEffect(() => {
        getPayments()
    }, [])
    console.log(payments)

    async function getPayments() {
        setIsLoadingList(true)

        axios.get(env.URL + 'payments').then((res) => {
            setPayments(res.data)
            setIsLoadingList(false)
        }).catch((error) => {
            setIsLoadingList(false)
            console.log(error)
        })
    }
    const handleRowClick = (stripeId, id) => {
        console.log(stripeId)
        if (idPayment && idPayment === stripeId) {
            navigate('/admin/payment/all')
        } else {
            navigate('/admin/payment/' + stripeId)
        }
    }
    useEffect(() => {
        if (idPayment === 'all') {
            setExpandedRow(null)
        } else {
            setPayment(idPayment)
            setExpandedRow(expandedRow === idPayment ? null : idPayment)
            getPaymentDetail(idPayment)
        }
    }, [idPayment])

    useEffect(() => {
        if (payment) {
            getPaymentDetail(payment)
        }
    }, [payments])

    function getPaymentDetail(idStripe) {
        setIsLoading(true)
        axios.get(env.URL + 'payments/stripe/' + idStripe).then((res) => {
            /* console.log(res) */
            if (res.data) {
                setPaymentDetail(res.data)
            }
            setIsLoading(false)
        }).catch((error) => {
            setIsLoading(false)
            console.log(error)
        })
    }
    // Pagination logic
    const indexOfLastPayment = currentPage * paymentsPerPage
    const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage
    const currentPayments = payments.slice(indexOfFirstPayment, indexOfLastPayment)

    const nextPage = () => setCurrentPage(currentPage + 1)
    const prevPage = () => setCurrentPage(currentPage - 1)

    const totalPages = Math.ceil(payments.length / paymentsPerPage)

    return (
        <div >
            {isLoadingList ?
                <FontAwesomeIcon icon={faSpinner} pulse style={{ color: 'gray', width: '100%', paddingBlock: 50 }} size='xl' />
                :
                <>
                    {payments.length > 0 &&
                        <div style={{ padding: 20 }}>
                            <div>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>ID Stripe</th>
                                            <th>Code article</th>
                                            <th>Code client</th>
                                            <th>Company</th>
                                            <th>Référence de transaction</th>
                                            <th>Montant</th>
                                            <th>Status</th>
                                            <th>Date Created</th>
                                            <th>Date Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentPayments.map((payment) => (
                                            <React.Fragment key={payment.idStripe}>
                                                <tr onClick={() => handleRowClick(payment.stripId, payment.id)} style={{ cursor: 'pointer' }}>
                                                    <td>{payment.id}</td>
                                                    <td>{payment.stripId}</td>
                                                    <td>{payment.code_article}</td>
                                                    <td>{payment.code_client}</td>
                                                    <td>{payment.company}</td>
                                                    <td>{payment.ref_transaction}</td>
                                                    <td>{payment.montant}</td>
                                                    <td>{payment.status}</td>
                                                    <td>{formatDateTime(payment.dateCreated)}</td>
                                                    <td>{formatDateTime(payment.dateUpdated)}</td>
                                                </tr>
                                                {expandedRow === payment.stripId &&
                                                    <tr>
                                                        <td colSpan={10} style={{ textAlign: 'left', padding: 20 }}>
                                                            {isLoading ?
                                                                <FontAwesomeIcon icon={faSpinner} pulse style={{ color: 'gray', width: '100%' }} size='xl' />
                                                                :
                                                                <>{paymentDetail &&
                                                                    <pre>
                                                                        {JSON.stringify(paymentDetail, null, 2)}
                                                                    </pre>
                                                                }</>
                                                            }

                                                        </td>
                                                    </tr>
                                                }
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </Table>

                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Button variant="secondary" onClick={prevPage} disabled={currentPage === 1}>Previous</Button>
                                    <div style={{ paddingInline: 10 }}>{currentPage}/{totalPages}</div>
                                    <Button variant="secondary" onClick={nextPage} disabled={currentPayments.length < paymentsPerPage}>Next</Button>
                                </div>
                            </div>
                        </div>
                    }
                </>
            }
        </div>

    )
}
export default PaymentAdmin