import {EntryPoints} from 'N/types'
import * as log from 'N/log'
import * as runtime from 'N/runtime'
import * as query from 'N/query'
import * as SUITEQL_REPORT from '../../definitions'
import * as REPORT_COLUMNS from '../../../customrecord_wtz_suiteql_report_columns/definitions'
import * as COLUMN_TYPES from '../../../customlist_wtz_sql_report_col_types/definitions'
import * as serverWidget from 'N/ui/serverWidget'
import * as file from 'N/file'

export const addSuiteQLResults = (context: EntryPoints.UserEvent.beforeLoadContext): void => {
    const { newRecord, form, type } = context
    log.audit('runSuiteQL start', {
        recordId: newRecord.id,
        contextType: type,
        executionContext: runtime.executionContext
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

const getFieldParameters = ({ columnName, recordId }): { id: string, type: serverWidget.FieldType, label: string } => {
    const queryResult = query.runSuiteQL({
        query: `
            SELECT
                RC.${REPORT_COLUMNS.FIELDS.COLUMN_LABEL}
                ,CT.scriptid
            FROM
                ${REPORT_COLUMNS.RECORD.SCRIPTID} RC
                LEFT JOIN ${COLUMN_TYPES.RECORD.SCRIPTID} CT ON RC.${REPORT_COLUMNS.FIELDS.COLUMN_DATA_TYPE} = CT.id
            WHERE
                ${REPORT_COLUMNS.FIELDS.SUITEQL_REPORT} = ?
                AND ${REPORT_COLUMNS.FIELDS.COLUMN_ID} = ?
        `,
        params: [recordId, columnName.replace(/\ /g,'_')],
    }).asMappedResults()[0]

    return {
        id: columnName.replace(/\ /g,'_'),
        type: serverWidget.FieldType[queryResult.scriptid as string],
        label: queryResult[REPORT_COLUMNS.FIELDS.COLUMN_LABEL] as string
    }
}
