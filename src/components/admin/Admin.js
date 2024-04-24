import { Route, Routes } from "react-router-dom"
import { useLocation, useNavigate } from 'react-router'
import Event from "./EventStripe"
import PaymentAdmin from "./PaymentAdmin"
import SubscriptionAdmin from "./SubscriptionAdmin"


function Admin() {
    const navigate = useNavigate()
    const currentRoute = useLocation().pathname
    return (
        <div className="listing">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div onClick={() => navigate('./payment/all')} className={currentRoute.startsWith('/admin/payment') ? 'sub-route choosen' : 'sub-route'}>Paiements</div>
                <div onClick={() => navigate('./subscription/all')} className={currentRoute.startsWith('/admin/subscription') ? 'sub-route choosen' : 'sub-route'}>Abonnements</div>
                <div onClick={() => navigate('./event/all')} className={currentRoute.startsWith('/admin/event') ? 'sub-route choosen' : 'sub-route'}>Stripe Events</div>
            </div>
            <Routes>
                <Route path="/payment/:id" element={< PaymentAdmin />} />
                <Route path="/subscription/:id" element={<SubscriptionAdmin />} />
                <Route path="/event/:id" element={<Event />} />
            </Routes>
        </div>
    )

}

export default Admin
