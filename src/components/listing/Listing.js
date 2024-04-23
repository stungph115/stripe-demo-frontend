import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import './Listing.css'
import ListCard from './ListCard'
import ListPayment from './ListPayment'
import ListSubscription from './ListSubscription'
import { Route, Routes } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router'
function Listing() {

    const currentRoute = useLocation().pathname
    /* console.log("currentRoute: ", currentRoute) */
    const codeClientdefault = 'ABCD1234'
    const [codeClient, setCodeClient] = useState(codeClientdefault)
    /* const [subRoute, setSubRoute] = useState(1) */
    const [selectedCard, setSelectedCard] = useState(null)
    const navigate = useNavigate()

    return (
        <div className='listing'>

            <div className='client-input' style={{ display: 'flex', justifyContent: 'center' }}>
                <label style={{ width: 'fit-content' }}>
                    Code client:
                    <Form.Control type="text" name="codeClient" value={codeClient} onChange={(e) => { setCodeClient(e.target.value) }} />
                </label>

            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div onClick={() => navigate('./')} className={(currentRoute === '/list' || currentRoute === '/list/') ? 'sub-route choosen' : 'sub-route'}>Méthodes de paiement</div>
                <div onClick={() => navigate('./payment/all')} className={currentRoute.startsWith('/list/payment') ? 'sub-route choosen' : 'sub-route'}>Mes paiements</div>
                <div onClick={() => navigate('./subscription/all')} className={currentRoute.startsWith('/list/subscription') ? 'sub-route choosen' : 'sub-route'}>Mes abonnements</div>
            </div>
            <Routes>
                <Route path="/" element={<ListCard codeClient={codeClient} selectedCard={selectedCard} setSelectedCard={setSelectedCard} />} />
                <Route path="/payment/:id" element={<ListPayment codeClient={codeClient} />} />
                <Route path="/subscription/:id" element={<ListSubscription codeClient={codeClient} />} />
            </Routes>
        </div >
    )
}
export default Listing
