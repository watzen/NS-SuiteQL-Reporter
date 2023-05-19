import {EntryPoints} from "N/types"
import * as log from 'N/log'
import * as runtime from 'N/runtime'
import * as record from 'N/record'
import * as query from 'N/query'
import * as REPORT_COLUMNS from '../../../customrecord_wtz_suiteql_report_columns/definitions'
import * as SUITEQL_REPORT from '../../definitions'
import * as COLUMN_TYPES from '../../../customlist_wtz_sql_report_col_types/definitions'

export const upsertReportColumns = (context: EntryPoints.UserEvent.afterSubmitContext) => {
    const { newRecord, oldRecord, type } = context
    log.audit('hideAllFields start', {
        recordId: newRecord.id,
        contextType: type,
        executionContext: runtime.executionContext
    })

    if(type === context.UserEventType.DELETE) {
        deleteAllOrphanColumns(oldRecord.id)
        return
    }

    const existingColumns = getExistingColumns(newRecord.id)
    log.debug('upsertReportColumns', { existingColumns })

    const newReportColumns = getNewReportColumns(newRecord)
    log.debug('upsertReportColumns', { newReportColumns })

    reactivateExistingColumns({ existingColumns, newReportColumns })

    inactivateRemovedColumns({ existingColumns, newReportColumns })

    addMissingColumns({ existingColumns, newReportColumns, recordId: newRecord.id})

}

type ExistingColumn = {
    columnId: string,
    id: number,
    isinactive: boolean,
}
const getExistingColumns = (recordId): ExistingColumn[] => {
    const columnQueryResults = query.runSuiteQL({
        query: `
            SELECT
                id,
                ${REPORT_COLUMNS.FIELDS.COLUMN_ID} as column_id
                ,isinactive
            FROM
                ${REPORT_COLUMNS.RECORD.SCRIPTID}
            WHERE
                ${REPORT_COLUMNS.FIELDS.SUITEQL_REPORT} = ?
        `,
        params: [recordId]
    }).asMappedResults()

    return columnQueryResults.map(result => ({
        id: result.id as number,
        columnId: result.column_id as string,
        isinactive: result.isinactive === 'T',
    }))
}

type NewReportColumn = {
    columnId: string,
    sampleValue: string | boolean | Date | number,
}
const getNewReportColumns = (newRecord): NewReportColumn[] => {
    const suiteQL = newRecord.getValue(SUITEQL_REPORT.FIELDS.SUITEQL)
    const columns = Object.keys(query.runSuiteQL({
        query: suiteQL
    }).asMappedResults()[0])

    const columnsWithSampleValue = query.runSuiteQL({
        query: `
            SELECT
                ${columns.map(columnName => `MAX(${columnName}) as ${columnName}`).join(',')}
            FROM
                (${suiteQL})
        `
    }).asMappedResults()[0]

    return Object.entries(columnsWithSampleValue).map(([columnId, sampleValue]) => ({
        columnId: columnId.replace(/\ /g,"_"),
        sampleValue
    }))
}

type ReactivateExistingColumns = {
    existingColumns: ExistingColumn[],
    newReportColumns: NewReportColumn[],
}
const reactivateExistingColumns = ({ existingColumns, newReportColumns }: ReactivateExistingColumns):void => {
    try {
        const inactiveExistingColumns = existingColumns.filter(column => {
            return column.isinactive && newReportColumns.some(existingColumn => existingColumn.columnId === column.columnId)
        })

        inactiveExistingColumns.forEach(column => {
            record.submitFields({
                id: column.id,
                type: REPORT_COLUMNS.RECORD.SCRIPTID,
                values: {
                    isinactive: false
                }
            })
        })
    } catch (e) {
        log.error('reactivateExistingColumns', { existingColumns, newReportColumns })
        throw e
    }
}

type InactivateRemovedColumns = {
    existingColumns: ExistingColumn[],
    newReportColumns: NewReportColumn[],
}
const inactivateRemovedColumns = ({ existingColumns, newReportColumns }: InactivateRemovedColumns):void => {
    try {
        const activeExistingColumns = existingColumns.filter(column => {
            return !column.isinactive && !newReportColumns.some(existingColumn => existingColumn.columnId === column.columnId)
        })

        activeExistingColumns.forEach(column => {
            record.submitFields({
                id: column.id,
                type: REPORT_COLUMNS.RECORD.SCRIPTID,
                values: {
                    isinactive: true
                }
            })
        })
    } catch (e) {
        log.error('inactivateRemovedColumns', { existingColumns, newReportColumns })
        throw e
    }
}

type AddMissingColumns = {
    existingColumns: ExistingColumn[],
    newReportColumns: NewReportColumn[],
    recordId: number,
}
const addMissingColumns = ({ existingColumns, newReportColumns, recordId }: AddMissingColumns):void => {
    try {
        const missingColumns = newReportColumns.filter(newReportColumn => {
            return !existingColumns.some(existingColumn => existingColumn.columnId === newReportColumn.columnId)
        })

        missingColumns.forEach(column => {
            const newColumn = record.create({
                type: REPORT_COLUMNS.RECORD.SCRIPTID,
            })
            const valuesToSet = {
                [REPORT_COLUMNS.FIELDS.COLUMN_ID]: column.columnId,
                [REPORT_COLUMNS.FIELDS.COLUMN_LABEL]: column.columnId.replace(/_/g,' '),
                [REPORT_COLUMNS.FIELDS.SUITEQL_REPORT]: recordId,
                [REPORT_COLUMNS.FIELDS.COLUMN_DATA_TYPE]: getDataTypeIdFromSampleValue({ sampleValue: column.sampleValue })
            }
            Object.entries(valuesToSet).forEach(([fieldId, value]) => {
                newColumn.setValue({ fieldId, value })
            })
            newColumn.save()
        })
    } catch (e) {
        log.error('addMissingColumns', { existingColumns, newReportColumns })
        throw e
    }
}

const getDataTypeIdFromSampleValue = ({ sampleValue }: {sampleValue: string | number | boolean | Date }): number => {
    let returnType = 'TEXT'

    if(Object.prototype.toString.call(sampleValue) === '[object Date]') {
        returnType = 'DATE'
    }
    if(typeof sampleValue === 'number' || (typeof sampleValue === 'string' && !Number.isNaN(Number(sampleValue)))) {
        const numberValue = Number(sampleValue)
        if(numberValue % 1 !== 0) {
            returnType = 'CURRENCY'
        } else {
            returnType = 'INTEGER'
        }
    }

    return getColumnTypeIdFromScriptId(returnType)
}

const getColumnTypeIdFromScriptId = (columnTypeScriptId): number => {
    return query.runSuiteQL({
        query: `
            SELECT id
            FROM ${COLUMN_TYPES.RECORD.SCRIPTID}
            WHERE scriptid = ?
        `,
        params: [columnTypeScriptId]
    }).asMappedResults()[0].id as number
}

const deleteAllOrphanColumns = (recordId) => {

    query.runSuiteQL({
        query: `
            SELECT id
            FROM ${REPORT_COLUMNS.RECORD.SCRIPTID}
            WHERE ${REPORT_COLUMNS.FIELDS.SUITEQL_REPORT} is null
            `,
    }).asMappedResults().forEach(result => {
        record.delete({
            type: REPORT_COLUMNS.RECORD.SCRIPTID,
            id: result.id as number,
        })
    })

}
