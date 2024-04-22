import { Route, Routes } from "react-router"
import PaymentForm from "../checkout/PaymentForm"
import Listing from "../listing/Listing"
import Admin from "../admin/Admin"

export default function AppRoutes() {
    return (
        <Routes>
            <Route path='/' element={<PaymentForm />} />
            <Route path='/list/*' element={<Listing />} />
            <Route path='/admin' element={<Admin />} />
        </Routes>
    )
}