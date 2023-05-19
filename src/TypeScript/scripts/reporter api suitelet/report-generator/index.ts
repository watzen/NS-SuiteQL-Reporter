import * as SUITEQL_REPORT from '../../../models/customrecord_wtz_suiteql_report/definitions'
import * as record from 'N/record'
import * as error from 'N/error'
import * as query from 'N/query'

type ReportRow = {
    [column: string]: string | number | boolean | Date | null
}
export const getReportData = (reportId: number | string): ReportRow[] => {

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

    const suiteQl = suiteQlReportRec.getValue(SUITEQL_REPORT.FIELDS.SUITEQL) as string

    return query.runSuiteQL({
        query: suiteQl,
    }).asMappedResults()

}
