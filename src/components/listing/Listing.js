import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import './Listing.css'
import ListCard from './ListCard'
import ListPayment from './ListPayment'
import ListSubscription from './ListSubscription'
import { Route, Routes } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router'
import { clients } from '../../Dummy'
function Listing() {
    //choose client
    const [client, setClient] = useState(clients[0])
    const currentRoute = useLocation().pathname
    /* console.log("currentRoute: ", currentRoute) */
    /* const [subRoute, setSubRoute] = useState(1) */
    const [selectedCard, setSelectedCard] = useState(null)
    const navigate = useNavigate()

    return (
        <div className='listing'>

            <div className='client-input' style={{ display: 'flex', justifyContent: 'center' }}>
                <label style={{ width: 'fit-content' }}>
                    Select client:
                    <Form.Select name="client" onChange={(e) => { setClient(clients.find(client => client.codeClient === e.target.value)) }} value={client.codeClient} style={{ width: '100%' }}>
                        {clients.map((client, i) => {
                            return (
                                <option value={client.codeClient} key={i}>{client.name}</option>
                            )
                        })}
                    </Form.Select>
                </label>

            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div onClick={() => navigate('./')} className={(currentRoute === '/list' || currentRoute === '/list/') ? 'sub-route choosen' : 'sub-route'}>Méthodes de paiement</div>
                <div onClick={() => navigate('./payment/all')} className={currentRoute.startsWith('/list/payment') ? 'sub-route choosen' : 'sub-route'}>Mes paiements</div>
                <div onClick={() => navigate('./subscription/all')} className={currentRoute.startsWith('/list/subscription') ? 'sub-route choosen' : 'sub-route'}>Mes abonnements</div>
            </div>
            <Routes>
                <Route path="/" element={<ListCard client={client} selectedCard={selectedCard} setSelectedCard={setSelectedCard} />} />
                <Route path="/payment/:id" element={<ListPayment client={client} />} />
                <Route path="/subscription/:id" element={<ListSubscription client={client} />} />
            </Routes>
        </div >
    )
}
export default Listing
