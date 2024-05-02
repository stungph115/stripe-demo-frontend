export const articles = [
    {
        codeArticle: 'ABCD1234',
        name: 'article test 1',
        price: 1000
    },
    {
        codeArticle: 'ABCD1234',
        name: 'article test 2',
        price: 1010
    },
    {
        codeArticle: 'ABCD1234',
        name: 'article test 3',
        price: 1050
    },
]
export const subscriptions = [

    {
        id: 1,
        name: 'Forfait mensuel',
        price: 1010,
        description: 'Un abonnment pour le test',
        recurring: {
            interval: 'month',
            interval_count: 1,
        }
    },
    {
        id: 2,
        name: 'Forfait annuel',
        description: 'Un abonnment pour le test',
        price: 1010,
        recurring: {
            interval: 'year',
            interval_count: 1,
        }
    },
    {
        id: 2,
        name: 'Forfait 4 semaine',
        description: 'Un abonnment pour le test',
        price: 1010,
        recurring: {
            interval: 'week',
            interval_count: 4,
        }
    },
]
export const clients = [
    {
        codeClient: 'CODECL1',
        name: 'NOM Prénom-test',
        email: 'st-pham@acheter-louer.fr'
    },
    {
        codeClient: 'CODECL2',
        name: 'NOM Prénom-test-2',
        email: 'rominage.115@gmail.com'
    },
]
export const coupons = [
    {
        id: 1,
        amount_off: 500,
        percent_off: null,
        repeating: null,
        description: '5€ immédiate',
        applyTo: 1,
        codes: ['05EIMME1', '05EIMME2', '05EIMME3', '05EIMME4', '05EIMME5']
    },
    {
        id: 2,
        amount_off: 500,
        percent_off: null,
        repeating: 1,
        description: '5€ sur 1er mois',
        applyTo: 1,
        codes: ['05E1STM1', '05E1STM2', '05E1STM3', '05E1STM4', '05E1STM5']
    },
    {
        id: 3,
        amount_off: null,
        percent_off: 10,
        repeating: null,
        description: '10% immédiate',
        applyTo: 1,
        codes: ['10PIMME1', '10PIMME2', '10PIMME3', '10PIMME4', '10PIMME5']
    },
    {
        id: 4,
        amount_off: null,
        percent_off: 10,
        repeating: 1,
        applyTo: 1,
        description: '10% sur 1er mois',
        codes: ['10P1STM1', '10P1STM2', '10P1STM3', '10P1STM4', '10P1STM5']
    },
    {
        id: 5,
        amount_off: 'to-1',
        percent_off: null,
        repeating: 1,
        applyTo: 1,
        description: '1€ sur 1er mois',
        codes: ['01E1STM1', '01E1STM2', '01E1STM3', '01E1STM4', '01E1STM5']
    }
]

export const companies = ['HTL', 'Tridisphere', 'AlloMandat']