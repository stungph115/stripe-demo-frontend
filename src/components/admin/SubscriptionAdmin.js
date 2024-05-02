import axios from "axios"
import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { env } from "../../env"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner } from "@fortawesome/free-solid-svg-icons"
import { Button, Table } from "react-bootstrap"
import { formatDateTime } from "../utils/utils"

function SubscriptionAdmin() {

    const idSubscription = useParams().id
    const navigate = useNavigate()
    const [subscriptions, setSubscriptions] = useState([])
    const [subscription, setSubscription] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [subscriptionsPerPage] = useState(15)
    const [expandedRow, setExpandedRow] = useState(null)
    const [subscriptionDetail, setSubscriptionDetail] = useState(null)
    const [isLoadingList, setIsLoadingList] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    console.log(subscriptions)
    useEffect(() => {
        getSubscriptions()
    }, [])
    async function getSubscriptions() {
        setIsLoadingList(true)

        axios.get(env.URL + 'subscription').then((res) => {
            setSubscriptions(res.data)
            setIsLoadingList(false)
        }).catch((error) => {
            setIsLoadingList(false)
            console.log(error)
        })
    }
    const handleRowClick = (stripeId, id) => {
        console.log(stripeId)
        if (idSubscription && idSubscription === stripeId) {
            navigate('/admin/subscription/all')
        } else {
            navigate('/admin/subscription/' + stripeId)
        }
    }
    useEffect(() => {
        if (idSubscription === 'all') {
            setExpandedRow(null)
        } else {
            setSubscription(idSubscription)
            setExpandedRow(expandedRow === idSubscription ? null : idSubscription)
            getSubscriptionDetail(idSubscription)
        }
    }, [idSubscription])

    useEffect(() => {
        if (subscription) {
            getSubscriptionDetail(subscription)
        }
    }, [subscriptions])

    function getSubscriptionDetail(idStripe) {
        setIsLoading(true)
        axios.get(env.URL + 'subscription/stripe/' + idStripe).then((res) => {
            /* console.log(res) */
            if (res.data) {
                setSubscriptionDetail(res.data)
            }
            setIsLoading(false)
        }).catch((error) => {
            setIsLoading(false)
            console.log(error)
        })
    }
    // Pagination logic
    const indexOfLastSubscription = currentPage * subscriptionsPerPage
    const indexOfFirstSubscription = indexOfLastSubscription - subscriptionsPerPage
    const currentSubscriptions = subscriptions.slice(indexOfFirstSubscription, indexOfLastSubscription)

    const nextPage = () => setCurrentPage(currentPage + 1)
    const prevPage = () => setCurrentPage(currentPage - 1)

    const totalPages = Math.ceil(subscriptions.length / subscriptionsPerPage)

    return (
        <div >
            {isLoadingList ?
                <FontAwesomeIcon icon={faSpinner} pulse style={{ color: 'gray', width: '100%', paddingBlock: 50 }} size='xl' />
                :
                <>
                    {subscriptions.length > 0 &&
                        <div style={{ padding: 20 }}>
                            <div>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>ID Stripe</th>
                                            <th>Code contrat</th>
                                            <th>Code client</th>
                                            <th>interval</th>
                                            <th>interval count</th>
                                            <th>Montant</th>
                                            <th>Status</th>
                                            <th>Date Created</th>
                                            <th>Date Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentSubscriptions.map((subscription) => (
                                            <React.Fragment key={subscription.idStripe}>
                                                <tr onClick={() => handleRowClick(subscription.stripId, subscription.id)} style={{ cursor: 'pointer' }}>
                                                    <td>{subscription.id}</td>
                                                    <td>{subscription.stripId}</td>
                                                    <td>{subscription.code_contrat}</td>
                                                    <td>{subscription.codeClient}</td>
                                                    <td>{subscription.interval}</td>
                                                    <td>{subscription.interval_count}</td>
                                                    <td>{subscription.montant}</td>
                                                    <td>{subscription.status}</td>
                                                    <td>{formatDateTime(subscription.dateCreated)}</td>
                                                    <td>{formatDateTime(subscription.dateUpdated)}</td>
                                                </tr>
                                                {expandedRow === subscription.stripId &&
                                                    <tr>
                                                        <td colSpan={10} style={{ textAlign: 'left', padding: 20 }}>
                                                            {isLoading ?
                                                                <FontAwesomeIcon icon={faSpinner} pulse style={{ color: 'gray', width: '100%' }} size='xl' />
                                                                :
                                                                <>{subscriptionDetail &&
                                                                    <pre>
                                                                        {JSON.stringify(subscriptionDetail, null, 2)}
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
                                    <Button variant="secondary" onClick={nextPage} disabled={currentSubscriptions.length < subscriptionsPerPage}>Next</Button>
                                </div>
                            </div>
                        </div>
                    }
                </>
            }
        </div>

    )
}
export default SubscriptionAdmin