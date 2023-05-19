import * as log from 'N/log'
import { EntryPoints } from 'N/types'
import { Resource } from '../../frontend/src/constants'
import * as columnGetterService from './column-getter/index'
import * as reportGeneratorService from './report-generator/index'
import { userPreferenceService } from './user-preferences/index'
import * as utils from './utils'

export function get(context: EntryPoints.Suitelet.onRequestContext): void {
    const { resource, reportId } = context.request.parameters

    const parsedResource = utils.parseResource(resource)

    if (parsedResource === Resource.UserPreferences) {
        const userPreferences = userPreferenceService.getUserPreferences()
        log.audit('userPreferences', userPreferences)
        context.response.setHeader( { name: 'content-type', value: 'application/json' } )
        context.response.write(JSON.stringify(userPreferences))
        return
    }

    if (parsedResource === Resource.RunReport && reportId) {
        const reportData = reportGeneratorService.getReportData(reportId)
        context.response.setHeader( { name: 'content-type', value: 'application/json' } )
        context.response.write(JSON.stringify(reportData))
        log.audit('reportData', reportData)
        return
    }

    if (parsedResource === Resource.GetColumns && reportId) {
        const columns = columnGetterService.getColumns(reportId)
        context.response.setHeader( { name: 'content-type', value: 'application/json' } )
        context.response.write(JSON.stringify(columns))
        log.audit('columns', columns)
        return
    }

}
