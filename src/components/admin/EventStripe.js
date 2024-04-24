import axios from "axios"
import { env } from "../../env"
import React, { useEffect, useState } from "react"
import { Table, Button } from "react-bootstrap"
import { formatDateTime } from "../utils/utils"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner } from "@fortawesome/free-solid-svg-icons"
import { useNavigate, useParams } from "react-router"

function Event() {
    const idEvent = useParams().id
    const navigate = useNavigate()
    const [events, setEvents] = useState([])
    const [event, setEvent] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [eventsPerPage] = useState(15)
    const [expandedRow, setExpandedRow] = useState(null)
    const [eventDetail, setEventDetail] = useState(null)
    const [isLoadingList, setIsLoadingList] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    useEffect(() => {
        getEvents()
    }, [])

    async function getEvents() {
        setIsLoadingList(true)

        axios.get(env.URL + 'webhook').then((res) => {
            setEvents(res.data)
            setIsLoadingList(false)
        }).catch((error) => {
            setIsLoadingList(false)
            console.log(error)
        })
    }
    const handleRowClick = (stripeId, id) => {
        console.log(stripeId)
        if (idEvent && idEvent === stripeId) {
            navigate('/admin/event/all')
        } else {
            navigate('/admin/event/' + stripeId)
        }
    }
    useEffect(() => {
        if (idEvent === 'all') {
            setExpandedRow(null)
        } else {
            setEvent(idEvent)
            setExpandedRow(expandedRow === idEvent ? null : idEvent)
            getEventDetail(idEvent)
        }
    }, [idEvent])

    useEffect(() => {
        if (event) {
            getEventDetail(event)
        }
    }, [events])

    function getEventDetail(idStripe) {
        setIsLoading(true)
        axios.get(env.URL + 'webhook/' + idStripe).then((res) => {
            /* console.log(res) */
            if (res.data) {
                setEventDetail(res.data)
            }
            setIsLoading(false)
        }).catch((error) => {
            setIsLoading(false)
            console.log(error)
        })
    }
    // Pagination logic
    const indexOfLastEvent = currentPage * eventsPerPage
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage
    const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent)

    const nextPage = () => setCurrentPage(currentPage + 1)
    const prevPage = () => setCurrentPage(currentPage - 1)

    const totalPages = Math.ceil(events.length / eventsPerPage)

    return (
        <div >
            {isLoadingList ?
                <FontAwesomeIcon icon={faSpinner} pulse style={{ color: 'gray', width: '100%', paddingBlock: 50 }} size='xl' />
                :
                <>
                    {events.length > 0 &&
                        <div style={{ padding: 20 }}>
                            <div>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>ID Stripe</th>
                                            <th>Type</th>
                                            <th>Date Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentEvents.map((event) => (
                                            <React.Fragment key={event.idStripe}>
                                                <tr onClick={() => handleRowClick(event.idStripe, event.id)} style={{ cursor: 'pointer' }}>
                                                    <td>{event.id}</td>
                                                    <td>{event.idStripe}</td>
                                                    <td>{event.type}</td>
                                                    <td>{formatDateTime(event.dateCreated)}</td>
                                                </tr>
                                                {expandedRow === event.idStripe &&
                                                    <tr>
                                                        <td colSpan={4} style={{ textAlign: 'left', padding: 20 }}>
                                                            {isLoading ?
                                                                <FontAwesomeIcon icon={faSpinner} pulse style={{ color: 'gray', width: '100%' }} size='xl' />
                                                                :
                                                                <>{eventDetail &&
                                                                    <pre>
                                                                        {JSON.stringify(eventDetail, null, 2)}
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
                                    <Button variant="secondary" onClick={nextPage} disabled={currentEvents.length < eventsPerPage}>Next</Button>
                                </div>
                            </div>
                        </div>
                    }
                </>
            }
        </div>

    )

}

export default Event
