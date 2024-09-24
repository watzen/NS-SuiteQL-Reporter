import { useEffect, useRef } from 'react'
import { Variables } from '../../../models/customrecord_wtz_suiteql_report_variable'
import { Resource } from '../constants'

function baseUrlAPI() {
    const scriptid = 'customscript_wtz_sl_suiteql_report'
    const deploymentid = 'customdeploy_wtz_sl_suiteql_report'
    return `/app/site/hosting/scriptlet.nl?script=${scriptid}&deploy=${deploymentid}`
}

function getSuiteletUrlForResource(options: {resource: Resource, reportId?: number, date?: string, variables?: Variables}): string {
    switch(options.resource) {
        case Resource.RunReport:
            return `${baseUrlAPI()}&resource=${options.resource}&reportId=${options.reportId}${options.variables ? `&variables=${encodeURIComponent(JSON.stringify(options.variables))}` : ''}`
        case Resource.GetColumns:
            return `${baseUrlAPI()}&resource=${options.resource}&reportId=${options.reportId}`
        case Resource.UserPreferences:
            return `${baseUrlAPI()}&resource=${options.resource}`
        case Resource.GetVariables:
            return `${baseUrlAPI()}&resource=${options.resource}&reportId=${options.reportId}`
    }
    throw new Error(`Invalid resource ${options.resource}`)
}

const toInteger = (floatNumber: number | string, precision = 2): number => {
    if (typeof floatNumber === 'string') {
        return Math.round(parseFloat(floatNumber) * 10 ** precision)
    }
    return Math.round(floatNumber * 10 ** precision)
}

const fromIntegerToFloat = (amount: string | number): string => {
    if (typeof amount === 'string') {
        return (parseInt(amount) / 100).toString()
    }
    return (amount / 100).toString()
}

const toLocaleString = (amount: string | number, locale = 'en-US'): string => {
    if (typeof amount === 'string') {
        return parseFloat(amount).toLocaleString(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }
    return amount.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

const formatDate = (date: Date | null): string | null => {
    if (date === null) {
        return null
    }
    if (Object.prototype.toString.call(date) === '[object Date]') {
    // it is a date
        if (isNaN(date.getTime())) {
            return null
        }
    } else {
    // not a date
        return null
    }

    const dateTimeFormat = Intl.DateTimeFormat('sv-SE', {
        dateStyle: 'short',
        timeStyle: undefined,
    })
    return dateTimeFormat.format(date)
}

type Timer = ReturnType<typeof setTimeout>
type SomeFunction = (date: Date, columnId: string) => void
/**
 *
 * @param func The original, non debounced function (You can pass any number of args to it)
 * @param delay The delay (in ms) for the function to return
 * @returns The debounced function, which will run only if the debounced function has not been called in the last (delay) ms
 */
export const useDateDebounce = (
    func: SomeFunction,
    delay = 1000
):unknown => {
    const timer = useRef<Timer>()

    useEffect(() => {
        return () => {
            if (!timer.current) { return }
            clearTimeout(timer.current)
        }
    }, [])

    return ((...args) => {
        const newTimer = setTimeout(() => {
            func(...args)
        }, delay)
        clearTimeout(timer.current)
        timer.current = newTimer
    }) as SomeFunction
}

const utils = {
    formatDate,
    fromIntegerToFloat,
    getSuiteletUrlForResource,
    toInteger,
    toLocaleString,
}

export default utils
