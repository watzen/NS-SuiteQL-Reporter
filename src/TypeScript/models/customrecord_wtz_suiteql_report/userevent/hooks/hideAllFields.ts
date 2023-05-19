import * as log from 'N/log'
import * as runtime from 'N/runtime'
import { EntryPoints } from 'N/types'
import * as serverWidget from 'N/ui/serverWidget'

export const hideAllFields = (context: EntryPoints.UserEvent.beforeLoadContext): void => {
    const { newRecord, form, type } = context
    log.audit('hideAllFields start', {
        recordId: newRecord.id,
        contextType: type,
        executionContext: runtime.executionContext,
    })

    if (
        runtime.executionContext !== runtime.ContextType.USER_INTERFACE
        || type !== context.UserEventType.VIEW
    ) { return }

    const fieldsNotToHide = [
        'linenumber',
        'nlloc',
        'nlsub',
        'rectype',
        '_eml_nkey_',
        'type',
        'nameorig',
        'nsapiCT',
        'sys_id',
        'nluser',
        'nldept',
        'entryformquerystring',
        'nlrole',
        '_csrf',
        'baserecordtype',
        'ownerid',
        'version',
        'submitnext_y',
        'submitnext_t',
    ]

    const fields = newRecord.getFields()
    log.audit('hideAllFields', { fields })
    fields.filter(field => (!fieldsNotToHide.includes(field))).forEach(id => {
        form.getField({ id })?.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN })
    })

    newRecord.getSublists().forEach(id => form.getSublist({ id }).displayType = serverWidget.SublistDisplayType.HIDDEN)

}
