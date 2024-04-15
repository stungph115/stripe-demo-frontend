import React, { useState } from 'react'
import { Form } from 'react-bootstrap'
import './Listing.css'
import ListCard from './ListCard'
import ListPayment from './ListPayment'
import ListSubscription from './ListSubscription'

function Listing() {
    const codeClientdefault = 'ABCD1234'
    const [codeClient, setCodeClient] = useState(codeClientdefault)
    const [subRoute, setSubRoute] = useState(1)
    const [selectedCard, setSelectedCard] = useState(null)

    return (
        <div className='listing'>

            <div className='client-input' style={{ display: 'flex', justifyContent: 'center' }}>
                <label style={{ width: 'fit-content' }}>
                    Code client:
                    <Form.Control type="text" name="codeClient" value={codeClient} onChange={(e) => { setCodeClient(e.target.value) }} />
                </label>

            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div onClick={() => setSubRoute(1)} className={subRoute === 1 ? 'sub-route choosen' : 'sub-route'}>Méthodes de paiement</div>
                <div onClick={() => setSubRoute(2)} className={subRoute === 2 ? 'sub-route choosen' : 'sub-route'}>Mes paiements</div>
                <div onClick={() => setSubRoute(3)} className={subRoute === 3 ? 'sub-route choosen' : 'sub-route'}>Mes abonnements</div>
            </div>
            {subRoute === 1 &&
                <ListCard codeClient={codeClient} selectedCard={selectedCard} setSelectedCard={setSelectedCard} />
            }
            {
                subRoute === 2 &&
                <ListPayment codeClient={codeClient} />
            }
            {
                subRoute === 3 &&
                <ListSubscription codeClient={codeClient} />
            }
        </div >
    )
}
export default Listing
