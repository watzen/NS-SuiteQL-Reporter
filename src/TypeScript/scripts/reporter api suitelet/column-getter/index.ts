import * as error from 'N/error'
import * as query from 'N/query'
import * as COLUMN_TYPES from '../../../models/customlist_wtz_sql_report_col_types/definitions'
import * as REPORT_COLUMNS from '../../../models/customrecord_wtz_suiteql_report_columns/definitions'

export type Column = {
    id: string,
    label: string,
    type: string,
}
export const getColumns = (reportId: number | string): Column[] => {

    if(!reportId) {
        throw error.create({
            name: 'INVALID_REPORT_ID',
            message: `Invalid report id. Received: ${reportId}`,
        })
    }

    return query.runSuiteQL({
        query: `
            SELECT
                RC.${REPORT_COLUMNS.FIELDS.COLUMN_ID} as id,
                RC.${REPORT_COLUMNS.FIELDS.COLUMN_LABEL} as label,
                CT.scriptId as type
            FROM
                ${REPORT_COLUMNS.RECORD.SCRIPTID} RC
                LEFT JOIN ${COLUMN_TYPES.RECORD.SCRIPTID} CT ON RC.${REPORT_COLUMNS.FIELDS.COLUMN_DATA_TYPE} = CT.id
            WHERE
                RC.${REPORT_COLUMNS.FIELDS.SUITEQL_REPORT} = ?
                AND RC.isinactive = 'F'
        `,
        params: [reportId],
    }).asMappedResults() as { id: string, label: string, type: string }[]
}
