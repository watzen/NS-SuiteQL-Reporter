import * as log from 'N/log'
import { EntryPoints } from 'N/types'
import { Resource } from '../../frontend/src/constants'
import { getVariables } from '../../models/customrecord_wtz_suiteql_report_variable'
import * as columnGetterService from './column-getter'
import * as reportGeneratorService from './report-generator'
import { userPreferenceService } from './user-preferences'
import * as utils from './utils'

export function get(context: EntryPoints.Suitelet.onRequestContext): void {
    const { resource, reportId, variables, pageNumber } = context.request.parameters

    const parsedResource = utils.parseResource(resource)

    if (parsedResource === Resource.UserPreferences) {
        const userPreferences = userPreferenceService.getUserPreferences()
        log.audit('userPreferences', userPreferences)
        context.response.setHeader( { name: 'Content-Type', value: 'application/json' } )
        context.response.write(JSON.stringify(userPreferences))
        return
    }

    if (parsedResource === Resource.RunReport && reportId) {
        const reportData = reportGeneratorService.getReportData({
            reportId,
            pageNumber: pageNumber | 0,
            variables: variables ? JSON.parse(variables) : undefined,
        })
        context.response.setHeader( { name: 'Content-Type', value: 'application/json' } )
        context.response.write(JSON.stringify(reportData))
        log.audit('reportData', reportData)
        return
    }

    if (parsedResource === Resource.GetColumns && reportId) {
        const columns = columnGetterService.getColumns(reportId)
        context.response.setHeader( { name: 'Content-Type', value: 'application/json' } )
        context.response.write(JSON.stringify(columns))
        log.audit('columns', columns)
        return
    }

    if (parsedResource === Resource.GetVariables && reportId) {
        const variables = getVariables(reportId)
        context.response.setHeader( { name: 'Content-Type', value: 'application/json' } )
        context.response.write(JSON.stringify(variables))
        log.audit('variables', variables)
        return
    }

}
