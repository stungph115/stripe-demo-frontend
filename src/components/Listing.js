import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'

function Listing() {
    const codeClientdefault = 'ABCD1234'
    const [codeClient, setCodeClient] = useState(codeClientdefault)
    const [getCustomerDisabled, setGetCustomerDisabled] = useState(true)

    function load() { }
    useEffect(() => {
        if (codeClient !== '') {
            setGetCustomerDisabled(false)
        }
    }, [codeClient])
    return (
        <div className='listing'>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <label style={{ width: '100%' }}>
                    Code client:
                    <Form.Control type="text" name="codeClient" value={codeClient} onChange={(e) => { setCodeClient(e.target.value) }} />
                </label>
                <Button variant="success" onClick={() => load()} disabled={getCustomerDisabled} style={{ height: 'fit-content', display: 'flex', marginTop: '15px' }}>
                    <div className='button'><FontAwesomeIcon icon={faArrowsRotate} /></div>
                </Button>
            </div>

        </div>
    )
}
export default Listing
