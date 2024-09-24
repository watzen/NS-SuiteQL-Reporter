import FileDownloadIcon from '@mui/icons-material/FileDownload'
import { Paper, Box, Button } from '@mui/material'
import Grid from '@mui/material/Grid2'
import {
    mkConfig,
    generateCsv,
    download
} from 'export-to-csv'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import type { MRT_ColumnDef } from 'material-react-table'
import React, { useEffect, useState } from 'react'
import { Variables } from '../../../models/customrecord_wtz_suiteql_report_variable'
import { Column } from '../../../scripts/reporter api suitelet/column-getter'
import { Resource } from '../constants'
import { UserPreferences } from '../types'
import utils from '../utils/utils'
import { ReportCriteria } from './ReportCriteria'


type ReportRow = {
    [column: string]: string | number | boolean | Date | null
}

const ReportViewer = (): JSX.Element => {

    const urlParams = new URLSearchParams(window.location.search)
    const reportId = parseInt(urlParams.get('id') as string, 10)

    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<ReportRow[]>([])
    const [criteria, setCriteria] = useState<Variables>({})

    const [userPreferences, setUserPreferences] = useState<UserPreferences>({ csvDelimiter: ',', csvDecimalDelimiter: '.', localeString: 'en-US' })
    const [reportColumns, setReportColumns] = useState<MRT_ColumnDef<ReportRow>[]>([])
    const [reportColumnOrder, setReportColumnOrder] = useState<string[]>([])

    useEffect(() => {
        const fetchData = async () => {

            const suiteletUrlUserPreferences = utils.getSuiteletUrlForResource({ resource: Resource.UserPreferences })
            const userPreferencesResponse = await fetch(suiteletUrlUserPreferences)
            const userPreferencesResponseJSON = await userPreferencesResponse.json()
            console.log('userPreferencesResponseJSON', userPreferencesResponseJSON)
            setUserPreferences(userPreferencesResponseJSON)

            const suiteletUrlGetVariables = utils.getSuiteletUrlForResource({ resource: Resource.GetVariables, reportId })
            const variablesResponse = await fetch(suiteletUrlGetVariables)
            const variablesResponseJSON = await variablesResponse.json()
            console.log('variablesResponseJSON', variablesResponseJSON)
            await setCriteria(variablesResponseJSON)

            const suiteletUrlGetColumns = utils.getSuiteletUrlForResource({
                resource: Resource.GetColumns,
                reportId,
            })
            const columnsResponse = await fetch(suiteletUrlGetColumns)
            const columnsData = await columnsResponse.json() as Column[]
            console.log('returned columnsData', columnsData)

            if(columnsData.length > 0) {
                const columnDefinitions = columnsData.map(column => {
                    const columnObj: MRT_ColumnDef<ReportRow> = {
                        accessorKey: column.id,
                        header: column.label,
                    }
                    switch (column.type) {
                        case 'CURRENCY':
                            columnObj.muiTableHeadCellProps = { align: 'right' }
                            columnObj.muiTableBodyCellProps = { align: 'center' }
                            columnObj.Cell = (props) => {
                                const cell = props.cell
                                return (cell.getValue() as number || 0).toLocaleString(userPreferencesResponseJSON.localeString, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })
                            }
                            break
                        case 'FLOAT':
                            columnObj.muiTableHeadCellProps = { align: 'right' }
                            columnObj.muiTableBodyCellProps = { align: 'center' }
                            break
                        case 'INTEGER':
                            columnObj.muiTableHeadCellProps = { align: 'right' }
                            columnObj.muiTableBodyCellProps = { align: 'center' }
                            break
                        case 'PERCENT':
                            columnObj.muiTableHeadCellProps = { align: 'right' }
                            columnObj.muiTableBodyCellProps = { align: 'center' }
                            columnObj.Cell = (props) => {
                                const cell = props.cell
                                return `${((cell.getValue() as number || 0) * 100).toLocaleString(userPreferencesResponseJSON.localeString, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}%`
                            }
                            break
                        case 'CHECKBOX':
                            columnObj.muiTableHeadCellProps = { align: 'center' }
                            columnObj.muiTableBodyCellProps = { align: 'center' }
                            columnObj.Cell = (props) => {
                                const cell = props.cell
                                return cell.getValue() === 'T' ? 'Yes' : 'No'
                            }
                            break
                    }

                    return columnObj

                }) as MRT_ColumnDef<ReportRow>[]
                await setReportColumns(columnDefinitions)
            }

            const suiteletUrlAPI = utils.getSuiteletUrlForResource({
                resource: Resource.RunReport,
                reportId: reportId,
                variables: variablesResponseJSON,
            })
            console.log('suiteletUrlAPI', suiteletUrlAPI)
            console.log('criteria', criteria)
            const reportResponse = await fetch(suiteletUrlAPI)
            const reportData = await reportResponse.json()
            console.log('returned reportData', reportData)
            if(reportData.length > 0) {
                await setReportColumnOrder(Object.keys(reportData[0]))
            }
            await setResults(reportData)
            await setLoading(false)

        }
        setLoading(true)
        fetchData()
        // NOTE: Run effect once on component mount, please
        // recheck dependencies if effect is updated.
    }, [])

    const refreshReport = () => {
        setLoading(true)
        const fetchData = async () => {
            const suiteletUrlAPI = utils.getSuiteletUrlForResource({
                resource: Resource.RunReport,
                reportId: reportId,
                variables: criteria,
            })
            console.log('suiteletUrlAPI', suiteletUrlAPI)
            console.log('criteria', criteria)
            const reportResponse = await fetch(suiteletUrlAPI)
            const reportData = await reportResponse.json()
            console.log('returned reportData', reportData)
            if(reportData.length > 0) {
                await setReportColumnOrder(Object.keys(reportData[0]))
            }
            await setResults(reportData)
            await setLoading(false)

        }
        fetchData()
    }

    const handleExportDataAsCSV = () => {
        const csvConfig = mkConfig({
            fieldSeparator: userPreferences.csvDelimiter,
            decimalSeparator: userPreferences.csvDecimalDelimiter,
            useKeysAsHeaders: true,
        })
        const csv = generateCsv(csvConfig)(results)
        download(csvConfig)(csv)
    }

    const handleCriteriaChange = (variableId: string, value: string) => {
        setCriteria(prev => ({
            ...prev,
            [variableId]: {
                ...prev[variableId],
                defaultValue: value,
            },
        }))
    }

    //pass table options to useMaterialReactTable
    const table = useMaterialReactTable({
        columns: reportColumns,
        data: results, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
        initialState: {
            density: 'compact',
        },
        state: {
            isLoading: loading,
            columnOrder: reportColumnOrder,
        },
        defaultColumn: {
            maxSize: 400,
            minSize: 80,
            size: 160, //default size is usually 180
        },
        muiTableContainerProps: { sx: { maxHeight: 'calc(100vh - 350px)', maxWidth: 'calc(100vw - 50px)' } },
        muiTableBodyProps: {
            sx: {
                //stripe the rows, make odd rows a darker color
                '& tr:nth-of-type(odd) > td': {
                    backgroundColor: '#f5f5f5',
                },
                '& tr:hover > td': {
                    backgroundColor: '#FEFEEE',
                },
            },
        },
        layoutMode: 'grid',
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
        enableRowSelection: false,
        enablePagination: false,
        enableRowVirtualization: true,
        //enableColumnOrdering: true,
        //enableColumnDragging: true,
        enableGlobalFilter: true,
        enableBottomToolbar: true,
        renderTopToolbarCustomActions: () => (
            <Box
                sx={{
                    display: 'flex',
                    gap: '16px',
                    padding: '8px',
                    flexWrap: 'wrap',
                }}
            >
                <Button
                    //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
                    onClick={handleExportDataAsCSV}
                    startIcon={<FileDownloadIcon />}
                >
                    Download as CSV
                </Button>
            </Box>
        ),
    })


    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
                <Paper elevation={3}>
                    <Grid container spacing={2} style={{ padding: 16 }}>
                        <Grid>
                            <Button
                                variant={'contained'}
                                onClick={refreshReport}
                            >
                                Refresh Report
                            </Button>
                        </Grid>
                        <Grid>
                            <ReportCriteria
                                criteria={criteria}
                                handleCriteriaChange={handleCriteriaChange}
                            />
                        </Grid>
                    </Grid>
                    <MaterialReactTable table={table} />
                </Paper>
            </Grid>
        </Grid>
    )
}

export default ReportViewer
