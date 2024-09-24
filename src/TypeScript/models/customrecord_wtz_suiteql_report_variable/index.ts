import * as error from 'N/error'
import * as query from 'N/query'
import * as COLUMN_TYPES from '../customlist_wtz_sql_report_col_types/definitions'
import * as REPORT_VARIABLES from './definitions'

export type Variable = {
    type: string,
    label: string,
    defaultValue: string,
}
export type Variables = {
    [variableId: string]: Variable,
}
export const getVariables = (reportId): Variables => {

    if(!reportId) {
        throw error.create({
            name: 'INVALID_REPORT_ID',
            message: `Invalid report id. Received: ${reportId}`,
        })
    }

    const variables = query.runSuiteQL({
        query: `
            SELECT
                RV.${REPORT_VARIABLES.FIELDS.VARIABLE_ID} as variable_id
                ,CT.scriptId as type
                ,RV.${REPORT_VARIABLES.FIELDS.VARIABLE_LABEL} as label
                ,RV.${REPORT_VARIABLES.FIELDS.VARIABLE_DEFAULT_SQL} as default_value
            FROM
                ${REPORT_VARIABLES.RECORD.SCRIPTID} RV
                LEFT JOIN ${COLUMN_TYPES.RECORD.SCRIPTID} CT ON RV.${REPORT_VARIABLES.FIELDS.VARIABLE_DATA_TYPE} = CT.id
            WHERE
                ${REPORT_VARIABLES.FIELDS.SUITEQL_REPORT} = ?
        `,
        params: [reportId],
    }).asMappedResults() as { variable_id: string, type: string, label: string, default_value: string }[]

    return variables.reduce((acc, variable) => {
        acc[variable.variable_id] = {
            type: variable.type as string,
            label: variable.label as string,
            defaultValue: query.runSuiteQL({
                query: `
                    SELECT
                        ${variable.type === 'DATE' ? 'to_char(' : ''}${variable.default_value}${variable.type === 'DATE' ? `, 'YYYY-MM-DD')`: ''} as default_value
                    FROM DUAL`,
            }).asMappedResults()[0].default_value as string,
        }
        return acc
    }, {} as Variables)
}
