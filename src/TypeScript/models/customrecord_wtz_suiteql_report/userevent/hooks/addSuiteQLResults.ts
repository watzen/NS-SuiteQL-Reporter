import * as file from 'N/file'
import * as log from 'N/log'
import * as runtime from 'N/runtime'
import { EntryPoints } from 'N/types'
import * as serverWidget from 'N/ui/serverWidget'

export const addSuiteQLResults = (context: EntryPoints.UserEvent.beforeLoadContext): void => {
    const { newRecord, form, type } = context
    log.audit('runSuiteQL start', {
        recordId: newRecord.id,
        contextType: type,
        executionContext: runtime.executionContext,
    })

    if (
        runtime.executionContext !== runtime.ContextType.USER_INTERFACE
        || type !== context.UserEventType.VIEW
    ) { return }

    form.addField({ id: 'custpage_react_app', label: 'Report React App', type: serverWidget.FieldType.INLINEHTML })
        .defaultValue = getReactApp().fileContents

    function getReactApp(): { fileContents: string } {
        const fileLoadOptions = './index.html'
        return { fileContents: file.load(fileLoadOptions).getContents() }
    }

}
