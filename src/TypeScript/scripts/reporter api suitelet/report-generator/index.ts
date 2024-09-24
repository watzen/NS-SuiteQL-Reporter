import * as error from 'N/error'
import * as query from 'N/query'
import * as record from 'N/record'
import * as SUITEQL_REPORT from '../../../models/customrecord_wtz_suiteql_report/definitions'
import { Variables } from '../../../models/customrecord_wtz_suiteql_report_variable'

type ReportRow = {
    [column: string]: string | number | boolean | Date | null
}
type GetReportData = {
    reportId: number | string,
    variables?: Variables
}
export const getReportData = ({ reportId, variables }: GetReportData): ReportRow[] => {

    if(!reportId) {
        throw error.create({
            name: 'INVALID_REPORT_ID',
            message: `Invalid report id. Received: ${reportId}`,
        })
    }

    const suiteQlReportRec = record.load({
        type: SUITEQL_REPORT.RECORD.SCRIPTID,
        id: (typeof reportId === 'number') ? reportId : parseInt(reportId, 10),
    })

    let suiteQl = suiteQlReportRec.getValue(SUITEQL_REPORT.FIELDS.SUITEQL) as string
    Object.entries(variables).forEach(([variableId, variable]) => {
        suiteQl = suiteQl.replace(new RegExp(`{{${variableId}}}`, 'g'), variable.defaultValue)
    })

    return query.runSuiteQL({
        query: suiteQl,
    }).asMappedResults()

}
