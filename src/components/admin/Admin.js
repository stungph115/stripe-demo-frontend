import axios from "axios"
import { env } from "../../env"
import React, { useEffect, useState } from "react"
import { Table, Button } from "react-bootstrap"
import { formatDateTime } from "../utils"

function Admin() {
    const [events, setEvents] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [eventsPerPage] = useState(15)
    const [expandedRow, setExpandedRow] = useState(null)
    const [eventDetail, setEventDetail] = useState(null)
    useEffect(() => {
        getEvents()
    }, []) // Empty dependency array to ensure the effect runs only once

    function getEvents() {
        axios.get(env.URL + 'webhook').then((res) => {
            setEvents(res.data)
        }).catch((error) => {
            console.log(error)
        })
    }
    const handleRowClick = (index, id) => {
        setExpandedRow(expandedRow === index ? null : index)
        axios.get(env.URL + 'webhook/' + id).then((res) => {
            console.log(res)
            if (res.data) {
                setEventDetail(res.data)
            }
        }).catch((error) => {
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
        <div className='listing'>
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
                                {currentEvents.map((event, index) => (
                                    <React.Fragment key={index}>
                                        <tr onClick={() => handleRowClick(index, event.id)} style={{ cursor: 'pointer' }}>
                                            <td>{event.id}</td>
                                            <td>{event.idStripe}</td>
                                            <td>{event.type}</td>
                                            <td>{formatDateTime(event.dateCreated)}</td>
                                        </tr>
                                        {expandedRow === index &&
                                            <tr>
                                                <td colSpan={4} style={{ textAlign: 'left', padding: 20 }}>
                                                    {eventDetail &&
                                                        <pre>
                                                            {JSON.stringify(eventDetail, null, 2)}
                                                        </pre>
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
        </div>

    )
}

export default Admin
