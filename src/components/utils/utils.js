import { faCcAmex, faCcMastercard, faCcVisa } from "@fortawesome/free-brands-svg-icons"
import { faCreditCard } from "@fortawesome/free-solid-svg-icons"

export const formatDateTime = (dateTimeString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(dateTimeString).toLocaleString('fr-FR', options)
}

export const formatMontant = (montant) => {
    const formattedMontant = montant.toString().replace(/(\d)(?=(\d{2})+(?!\d))/g, '$1,')
    return formattedMontant
}
export const formatInterval = (interval) => {
    switch (interval) {
        case 'week':
            return 'semaine'
        case 'month':
            return 'mois'
        case 'year':
            return 'année'
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
    ];
    return months[monthNumber - 1]
}
