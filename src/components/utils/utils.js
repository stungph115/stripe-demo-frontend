import { faCcAmex, faCcMastercard, faCcVisa } from "@fortawesome/free-brands-svg-icons"
import { faCreditCard } from "@fortawesome/free-solid-svg-icons"
import moment from 'moment'
moment.locale('fr')
export const formatDateTime = (dateTimeString) => {
    const formattedDateTime = moment(dateTimeString).format('DD MMM YYYY [à] HH[h]mm')
    return formattedDateTime
}

export const formatMontant = (montant) => {
    const formatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR', // Change currency to EUR for Euros
        minimumFractionDigits: 2,
        currencyDisplay: 'symbol',
    });

    return formatter.format(montant / 100)
}
export const formatInterval = (interval) => {
    switch (interval) {
        case 'week':
            return 'semaine'
        case 'month':
            return 'mois'
        case 'year':
            return 'an'
        default:
            return null
    }

}
export const getIconByBrand = (brand) => {
    switch (brand) {
        case 'visa':
            return faCcVisa
        case 'mastercard':
            return faCcMastercard
        case 'american_express':
            return faCcAmex
        // Add more cases for other card brands if needed
        default:
            return faCreditCard
    }
}
export function getFrenchMonthName(monthNumber) {
    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ]
    return months[monthNumber - 1]
}
