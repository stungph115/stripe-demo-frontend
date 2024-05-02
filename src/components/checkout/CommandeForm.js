import { Form, Card } from 'react-bootstrap';
import { formatMontant } from '../utils/utils';
import { useEffect, useState } from 'react';
import { articles, companies } from '../../Dummy';
function OrderForm({ nomSociete, setNomsociete, montant, setMontant }) {
    const [articleChosen, setArticleChosen] = useState([])

    function chooseArticle(article) {
        if (articleChosen.includes(article)) {
            setArticleChosen(articleChosen.filter((chosenArticle) => chosenArticle !== article))
        } else {
            setArticleChosen([...articleChosen, article])
        }
    }
    useEffect(() => {
        let total = 0
        //total amount of article
        articleChosen.forEach((article) => {
            total += article.price
        })
        setMontant(total)
        //amount of subscription

    }, [articleChosen])
    return (
        <>
            <div>
                <label style={{ width: '100%' }}>
                    Nom de la société:
                    <Form.Select name="company" onChange={(e) => { setNomsociete(e.target.value) }} value={nomSociete}>
                        {companies.map((company, i) => (
                            <option value={company} key={i}>{company}</option>
                        ))}
                    </Form.Select>
                </label>
            </div>
            <div style={{ marginTop: 10 }}>
                <label style={{ width: '100%' }}>
                    Sélectionner des articles:
                </label>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {articles.map((article, i) => (
                        <li key={i} onClick={() => chooseArticle(article)} >
                            <Card style={{ marginBottom: '10px' }} className='article'>
                                <Card.Body style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ marginLeft: 20 }}>
                                        <Card.Title>{article.name}</Card.Title>
                                        <Card.Text>{formatMontant(article.price)} €</Card.Text>
                                    </div>
                                    <div style={{ marginLeft: 'auto' }}>
                                        <Form.Check
                                            type="checkbox"
                                            checked={articleChosen.includes(article)}
                                            onChange={() => chooseArticle(article)}
                                        />
                                    </div>
                                </Card.Body>
                            </Card>
                        </li>
                    ))}
                </ul>
            </div>
            {articleChosen.length > 0 &&
                <div className='notice'>* Article choisi:<strong> {articleChosen.map(article => article.name).join(', ')}</strong></div>

            }
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <label >
                    Montant total:
                </label>
                <p>{formatMontant(montant)} €</p>
            </div>
        </>
    )
}

export default OrderForm;
