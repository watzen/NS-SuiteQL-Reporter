/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
import * as https from 'N/https'
import * as log from 'N/log'
import { EntryPoints } from 'N/types'
import { get } from './reporter api suitelet/controller-api'

export function onRequest(context: EntryPoints.Suitelet.onRequestContext): void {
    const eventRouter = {
        [https.Method.GET]: get,
    }
    if (eventRouter[context.request.method] === undefined) {
        log.error({
            title: 'unsupported request received',
            details: `No handler for route: ${context.request.method}`,
        })
        return
    }
    try {
        eventRouter[context.request.method](context)
    } catch (err) {
        log.error('Failed to handle ' + context.request.method + ' request ' + err.name, err.message)
    }
    log.debug('Suitelet', 'Responded to request')
}
