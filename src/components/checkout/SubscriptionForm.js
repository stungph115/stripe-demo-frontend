import { useEffect, useState } from "react"
import { Card, Form } from "react-bootstrap"
import { formatInterval, formatMontant } from "../utils/utils"
import { subscriptions } from "../../Dummy"

function SubscriptionForm({ chosenSubscription, setChosenSubscription, paymentDay, setPaymentDay, paymentMonth, setPaymentMonth }) {

    const [dayOptions, setDayOptions] = useState(daysInMonth)
    var daysInMonth = Array.from({ length: 31 }, (_, index) => index + 1)
    //day-month validator
    useEffect(() => {
        if (paymentMonth == 2 && paymentDay > 28) {
            setPaymentDay(28)
        }
        if (['4', '6', '9', '11'].includes(paymentMonth) && paymentDay == 31) {
            setPaymentDay(30)
        }
    }, [paymentMonth])
    useEffect(() => {
        var lastDayofMonth
        if (paymentMonth === '2') {
            lastDayofMonth = 28
        } else if (['4', '6', '9', '11'].includes(paymentMonth)) {
            lastDayofMonth = 30
        } else {
            lastDayofMonth = 31
        }
        setDayOptions(Array.from({ length: lastDayofMonth }, (_, index) => index + 1))
    }, [paymentMonth])

    function chooseSubscription(sub) {
        if (chosenSubscription && chosenSubscription === sub) {
            setChosenSubscription(null)
        } else {
            setChosenSubscription(sub)
        }
    }
    return (
        <>

            <div>
                <label>
                    Choisir un abonnement
                </label>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {subscriptions.map((sub, i) => (
                        <li key={i} onClick={() => chooseSubscription(sub)} >
                            <Card style={{ marginBottom: '10px' }} className={chosenSubscription && chosenSubscription === sub ? 'article chosen' : 'article'}>
                                <Card.Body >
                                    <Card.Title>{sub.name}</Card.Title>
                                    <Card.Text>{sub.description}</Card.Text>
                                    <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'center' }}>
                                        <div style={{ fontSize: 30, marginRight: 5 }}> <strong> {formatMontant(sub.price)} € </strong></div>
                                        <div> / {sub.recurring.interval_count > 1 && sub.recurring.interval_count} {formatInterval(sub.recurring.interval)}{sub.recurring.interval_count > 1 && sub.recurring.interval !== 'month' && 's'}</div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </li>
                    ))}
                </ul>

                {chosenSubscription && chosenSubscription.recurring.interval !== 'week' &&
                    <div style={{ display: "flex", alignItems: 'end', justifyContent: 'space-evenly' }}>
                        <label>Date facturation:</label>
                        {chosenSubscription.recurring.interval === 'year' &&
                            <label>
                                Mois :
                                <Form.Select value={paymentMonth} name="paymentMonth" onChange={(e) => { setPaymentMonth(e.target.value) }} >
                                    <option value={1}>Janvier</option>
                                    <option value={2}>Février</option>
                                    <option value={3}>Mars</option>
                                    <option value={4}>Avril</option>
                                    <option value={5}>Mai</option>
                                    <option value={6}>Juin</option>
                                    <option value={7}>Juillet</option>
                                    <option value={8}>Août</option>
                                    <option value={9}>Septembre</option>
                                    <option value={10}>Octobre</option>
                                    <option value={11}>Novembre</option>
                                    <option value={12}>Décembre</option>
                                </Form.Select>
                            </label>
                        }
                        <label>
                            Jour :
                            <Form.Select name="paymentDay" value={paymentDay} onChange={(e) => { setPaymentDay(e.target.value) }}>
                                {dayOptions.map((day, i) => {
                                    return (
                                        <option value={day} key={i}>{day}</option>
                                    )
                                })}
                            </Form.Select>
                        </label>
                    </div>
                }
            </div>
            {chosenSubscription && <div className='notice'>
                <>* Abonnement choisi: <strong> {chosenSubscription.name}</strong> à <strong> {formatMontant(chosenSubscription.price)} € </strong> /{chosenSubscription.recurring.interval_count > 1 && chosenSubscription.recurring.interval_count} {formatInterval(chosenSubscription.recurring.interval)}{chosenSubscription.recurring.interval_count > 1 && chosenSubscription.recurring.interval !== 'month' && 's'}
                </>
                <br />
                {/* check paymentday for week */}
                {chosenSubscription.recurring.interval !== 'week' &&
                    <>
                        ** Prélèvement définie est
                        {chosenSubscription.recurring.interval === 'month' ?
                            <> au <strong>{paymentDay > 1 ? paymentDay + 'ème' : '1er'}</strong> jour du mois {paymentDay == 31 && "(ou le dernier jour du mois)"}  {paymentDay == 30 && "(ou le dernier jour de février)"}</>
                            :
                            <> le <strong>{paymentDay}/{paymentMonth}</strong> de chaque année</>
                        }

                    </>
                }
            </div>}
        </>
    )

}
export default SubscriptionForm