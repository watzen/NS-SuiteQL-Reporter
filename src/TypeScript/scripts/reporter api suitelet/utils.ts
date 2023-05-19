import * as log from 'N/log'
import { Resource } from '../../frontend/src/constants'

export function toInteger(floatNumber: number | string, precision = 2): number {
    if (typeof floatNumber === 'string') {
        return Math.round(parseFloat(floatNumber) * 10 ** precision)
    }
    return Math.round(floatNumber * 10 ** precision)
}

export function fromIntegerToFloat(amount: string | number): string {
    if (typeof amount === 'string') {
        return (parseInt(amount) / 100).toString()
    }
    return (amount / 100).toString()
}

export function fromIntegerToFloatNum(amount: string | number): number {
    if (typeof amount === 'string') {
        return (parseInt(amount) / 100)
    }
    return (amount / 100)
}

export function parseResource(resource: string): Resource {
    const parsedResource = parseInt(resource)
    log.debug('Utils.parseResource(resource)', { value: resource, label: Resource[resource] })
    if (!Object.values(Resource).includes(parsedResource)) {
        throw new Error(`Invalid resource provided. Must be one of ${JSON.stringify(Object.values(Resource))}, sent: ${JSON.stringify(resource)}`)
    }
    return parsedResource
}
