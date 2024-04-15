import { CardCvcElement, CardExpiryElement, CardNumberElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { env } from '../../env'
import { Button, Form, Modal } from 'react-bootstrap'
import { faCheckCircle, faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons'
import { getIconByBrand } from '../utils'

function ListCard({ codeClient, selectedCard, setSelectedCard }) {
    const stripe = useStripe()
    const elements = useElements()
    const [isCardNumberFilled, setCardNumberFilled] = useState(false)
    const [isCardExpiryFilled, setCardExpiryFilled] = useState(false)
    const [isCardCvcFilled, setCardCvcFilled] = useState(false)
    const [disabledAddCard, setDisabledAddCard] = useState(true)
    const [disabledDeleteCard, setDisabledDeleteCard] = useState(false)
    const [cards, setCards] = useState([])
    const [cardDefault, setCardDefault] = useState(null)
    const [showCardInput, setShowCardInput] = useState(false)
    const [showDeteleCard, setShowDeteleCard] = useState(false)
    const [error, setError] = useState(null)
    const [setAsDefaultCard, setSetAsDefaultCard] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    console.log('selectedCard: ', selectedCard)
    console.log(cards)
    useEffect(() => {
        getPaymentMethods(codeClient)
    }, [codeClient])
    function getPaymentMethods(codeClient) {

        axios.get(env.URL + 'customer/' + codeClient).then((res) => {
            setCards(res.data.entity)
            if (res.data.entity.length > 0) {
                const findCardDefault = res.data.entity.filter(card => card.default === true)
                if (findCardDefault) {
                    setCardDefault(findCardDefault[0].id)
                } else {
                    setCardDefault(null)
                }
            }
        }).catch((err) => {
            console.log(err)
        })
    }
    const handleCardNumberChange = (event) => {
        setCardNumberFilled(event.complete)
    }
    const handleCardExpiryChange = (event) => {
        setCardExpiryFilled(event.complete)
    }
    const handleCardCvcChange = (event) => {
        setCardCvcFilled(event.complete)
    }

    useEffect(() => {
        if (isCardNumberFilled && isCardExpiryFilled && isCardCvcFilled) {
            setDisabledAddCard(false)
        } else {
            setDisabledAddCard(true)
        }
    }, [isCardNumberFilled, isCardExpiryFilled, isCardCvcFilled])
    useEffect(() => {
        if (isLoading) {
            setDisabledAddCard(true)
            setDisabledDeleteCard(true)
        } else {
            setDisabledAddCard(false)
            setDisabledDeleteCard(false)
        }
    }, [isLoading])

    async function addCard() {
        var stop = false
        setIsLoading(true)
        setError(null)
        const cardElement = elements.getElement(CardNumberElement)
        try {
            const newPaymentMethod = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                /*  billing_details: {
                     name: 'Jenny Rosen',
                     email:'',
                 }, */
            })
            const params = {
                codeClient: codeClient,
                paymentMethod: newPaymentMethod.paymentMethod.id
            }
            await axios.post(env.URL + 'customer', params).then((res) => {
                console.log("res axios attach payment: ", res)
                if (res.data.statusCode === 200) {
                    if (setAsDefaultCard) {
                        setDefaultCard(newPaymentMethod.paymentMethod.id)
                    }
                    setShowCardInput(false)
                    getPaymentMethods(codeClient)
                    setIsLoading(false)
                    setSelectedCard(newPaymentMethod.id)
                }
            }).catch((err) => {
                console.log("error axios attach payment: ", err)
                if (err.response.data.message) {
                    if (err.response.data.message === 'STRIPE_ERROR_card_declined') {
                        setError("La carte a été refusée")
                        setIsLoading(false)
                    } else if (err.response.data.message === 'STRIPE_ERROR_incorrect_cvc') {
                        setError("Code cryptogramme visuel incorrect")
                        setIsLoading(false)
                    } else if (err.response.data.message === 'STRIPE_ERROR_processing_error') {
                        setError("Une erreur s'est produite lors du traitement de la carte")
                        setIsLoading(false)
                    } else if (err.response.data.message === 'STRIPE_ERROR_incorrect_number') {
                        setError("Numéro de la carte est incorrect")
                        setIsLoading(false)
                    } else {
                        setError(err.response.data.message)
                        setIsLoading(false)
                    }
                }
                stop = true
            })
        } catch (err) {
            console.log(err)
            setIsLoading(false)
            return
        }
        if (stop) {
            setIsLoading(false)
            return
        }
    }
    async function setDefaultCard(paymentMethod) {
        setIsLoading(true)
        axios.post(env.URL + 'customer/update-default-pm', {
            paymentMethod: paymentMethod,
            custom: codeClient
        }).then((res) => {
            console.log(res)
            console.log('setting card as default done')
            getPaymentMethods(codeClient)
            setIsLoading(false)
        }).catch((err) => {
            setIsLoading(false)
            console.log(err)
        })
        return true
    }
    async function deleteCard(paymentMethod) {
        setIsLoading(true)
        axios.delete(env.URL + 'customer/' + paymentMethod).then((res) => {
            console.log(res)
            getPaymentMethods(codeClient)
            setIsLoading(false)
            setShowDeteleCard(false)
        }).catch((err) => {
            console.log(err)
            setIsLoading(false)
        })
    }
    function handleDeleteButtonClick(item) {
        setShowDeteleCard(true)
        setSelectedCard(item)
    }
    return (
        <>
            {cards.length > 0 ?
                <>
                    {cards.map((item, i) => {

                        return (
                            <React.Fragment key={i}>
                                <div className={selectedCard && selectedCard.id === item.id ? 'credit-card-item choosen' : 'credit-card-item'} style={{ width: '100%' }} onClick={() => setSelectedCard(item)}>
                                    <FontAwesomeIcon icon={getIconByBrand(item.display_brand)} style={{ width: '10%' }} size='xl' className='card-brand' />
                                    <div className='card-last4' style={{ width: '40%' }}>**** **** **** {item.last4}</div>
                                    <div className='card-exp' style={{ width: '10%' }}>{item.exp_month > 9 ? item.exp_month : '0' + item.exp_month}/{String(item.exp_year).slice(-2)}</div>
                                    {item.id === cardDefault ?
                                        <div style={{ paddingInline: 10, width: '40%' }}>défaut</div>
                                        :
                                        <div className="set-default-text" style={{ paddingInline: 10, width: '40%' }} onClick={() => setDefaultCard(item.id)}>
                                            {isLoading ?
                                                <FontAwesomeIcon icon={faSpinner} pulse />
                                                :
                                                'définir par défaut'
                                            }
                                        </div>
                                    }
                                    <div className='card-delete' onClick={() => handleDeleteButtonClick(item)}><FontAwesomeIcon icon={faTrash} /></div>

                                </div>

                            </React.Fragment>

                        )
                    })}
                    {selectedCard &&
                        <Modal size='lg' show={showDeteleCard} onHide={() => setShowDeteleCard(false)} centered>
                            <Modal.Header closeButton className="px-4">
                                <Modal.Title className="ms-auto"> Suppression d'une carte</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="d-flex justify-content-center align-items-center" >
                                Voulez-vous retirer cette carte ?
                                <div className={'credit-card-item'} style={{ width: '60%', marginLeft: 30 }}>
                                    <FontAwesomeIcon icon={getIconByBrand(selectedCard.display_brand)} style={{ width: '10%' }} size='xl' className='card-brand' />
                                    <div className='card-last4' style={{ width: '40%' }}>**** **** **** {selectedCard.last4}</div>
                                    <div className='card-exp' style={{ width: '10%' }}>{selectedCard.exp_month > 9 ? selectedCard.exp_month : '0' + selectedCard.exp_month}/{String(selectedCard.exp_year).slice(-2)}</div>
                                </div>

                            </Modal.Body>
                            <Modal.Footer className="d-flex justify-content-center" >
                                <Button variant='danger' onClick={() => deleteCard(selectedCard.id)} disabled={disabledDeleteCard}>
                                    {isLoading ?
                                        <FontAwesomeIcon icon={faSpinner} pulse />
                                        :
                                        "Supprimer"
                                    }
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    }
                </>
                :
                <div className='empty-text'>Aucune méthode de paiement enregistrée</div>
            }
            <div onClick={() => setShowCardInput(true)} className='new-card-button-listing'>
                <FontAwesomeIcon icon={faCircleXmark} style={{ color: 'black', padding: 10, transform: 'rotate(45deg)' }} size='xl' />
                Ajouter une carte
            </div>
            <Modal size='xl' show={showCardInput} onHide={() => setShowCardInput(false)} centered>
                <Modal.Header closeButton className="px-4">
                    <Modal.Title className="ms-auto"> Ajouter une carte</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex justify-content-center align-items-center" >
                    <div style={{
                        boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19)",
                        padding: 20,
                        margin: 20,
                        borderRadius: 5,
                        width: '50%',
                    }}>

                        < div style={{ padding: 20 }}>
                            <div className='card-detail-title'>N° de la carte</div>
                            <div className='card-element' style={{ marginBottom: '20px' }}>
                                <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                    <div style={{ width: '80%' }}>
                                        <CardNumberElement
                                            options={{ showIcon: true, placeholder: '1234 5678 9012 3456' }}
                                            onChange={handleCardNumberChange}
                                        />
                                    </div>
                                    {isCardNumberFilled && <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#45a049", width: '10%' }} />}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <div>
                                    <div className='card-detail-title'>Date d'expiration </div>
                                    <div className='card-element'>
                                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                            <div style={{ width: '80%' }}>
                                                <CardExpiryElement onChange={handleCardExpiryChange} />
                                            </div>
                                            {isCardExpiryFilled && <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#45a049", width: '20%' }} />}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className='card-detail-title'>Cryptogramme visuel</div>
                                    <div className='card-element'>
                                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                            <div style={{ width: '80%' }}>
                                                <CardCvcElement options={{ placeholder: '123' }} onChange={handleCardCvcChange} />
                                            </div>
                                            {isCardCvcFilled && <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#45a049", width: '20%' }} />}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && <div style={{ color: 'red', marginBlock: 10 }}>{error}</div>}
                        <div className='check-box-save-card' onClick={() => setSetAsDefaultCard(setAsDefaultCard ? false : true)}>
                            <Form.Check
                                type="checkbox"
                                checked={setAsDefaultCard}
                                onChange={() => setSetAsDefaultCard(setAsDefaultCard ? false : true)}
                                style={{ marginRight: 10 }}
                            />

                            Définir cette carte comme méthode de paiement par défaut
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-center" >
                    <Button variant='success' onClick={() => addCard()} disabled={disabledAddCard}>
                        {isLoading ?
                            <FontAwesomeIcon icon={faSpinner} pulse />
                            :
                            "Ajouter"
                        }
                    </Button>
                </Modal.Footer>
            </Modal>

        </>
    )
}
export default ListCard