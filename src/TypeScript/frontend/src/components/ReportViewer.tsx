import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import TableChartIcon from '@mui/icons-material/TableChart'
import { Paper, Box, Button, IconButton, Tooltip, Typography, Stack } from '@mui/material'
import Grid from '@mui/material/Grid2'
import ExcelJS from 'exceljs'
import {
    mkConfig,
    generateCsv,
    download
} from 'export-to-csv'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import type { MRT_ColumnDef } from 'material-react-table'
import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Variables } from '../../../models/customrecord_wtz_suiteql_report_variable'
import { Column } from '../../../scripts/reporter api suitelet/column-getter'
import { Resource } from '../constants'
import { UserPreferences } from '../types'
import utils from '../utils/utils'
import { FetchingMoreThanLimitDialog } from './FetchingMoreThanLimitDialog'
import { ReportCriteria } from './ReportCriteria'


type ReportRow = {
    [column: string]: string | number | boolean | Date | null
}

type CustomColumnDef<TData extends Record<string, any>> = MRT_ColumnDef<TData> & {
    footerAggregator?: 'sum' | 'avg' | 'count' | string; // you can customize this union
}

const ReportViewer = (): JSX.Element => {

    const urlParams = new URLSearchParams(window.location.search)
    const reportId = parseInt(urlParams.get('id') as string, 10)

    const abortFetchRef = useRef(false)

    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<ReportRow[]>([])
    const [footerValues, setFooterValues] = useState<Record<string, number>>({})
    const [criteria, setCriteria] = useState<Variables>({})

    const [userPreferences, setUserPreferences] = useState<UserPreferences>({ csvDelimiter: ',', csvDecimalDelimiter: '.', localeString: 'en-US' })
    const [reportColumns, setReportColumns] = useState<CustomColumnDef<ReportRow>[]>([])
    const [reportColumnOrder, setReportColumnOrder] = useState<string[]>([])

    useEffect(() => {
        if (results.length > 0 && reportColumns.length > 0) {
            const footerValuesObj: Record<string, number> = {}
            reportColumns.forEach(column => {
                if (column.accessorKey && column.footerAggregator === 'sum') {
                    footerValuesObj[column.accessorKey as string] = results.reduce((sum, row) => {
                        return sum + (row[column.accessorKey as string] as number || 0)
                    }, 0)
                }
                if(column.accessorKey && column.footerAggregator === 'count') {
                    footerValuesObj[column.accessorKey as string] = results.filter(row => row[column.accessorKey as string] !== null).length
                }
            })
            console.log('Calculated footer values:', footerValuesObj)
            setFooterValues(footerValuesObj)
        }
    }, [results, reportColumns])

    const memoizedColumns = useMemo(() => {
        return reportColumns.map(column => ({
            ...column,
            filterSelectOptions: ['select', 'multi-select'].includes((column.filterVariant as string)) ?
                Array.from(new Set(results.map(row => row[column.accessorKey as string]))).sort((a, b) => (a as string)?.localeCompare(b as string))
                : undefined,
            Footer: column.Footer ? ({ table }) => {
                // Calculate the sum of filtered rows
                const filteredRows = table.getFilteredRowModel().rows

                if(column.footerAggregator === 'count') {
                    const columnCount = filteredRows.filter(row =>  row.getValue(column.accessorKey as string) !== null).length
                    return (
                        <Stack>
                            Count: {columnCount.toLocaleString(userPreferences.localeString)}
                        </Stack>
                    )
                }
                if(column.footerAggregator === 'sum') {
                    const columnSum = filteredRows.reduce((sum, row) => {
                        const cellValue = row.getValue(column.accessorKey as string)
                        return sum + (typeof cellValue === 'number' ? cellValue : 0)
                    }, 0)

                    return (
                        <Stack>
                            Sum: {columnSum.toLocaleString(userPreferences.localeString, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </Stack>
                    )
                }

            } : undefined,
        }))
    }, [results, reportColumns, footerValues, userPreferences])

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

                    const columnObj: CustomColumnDef<ReportRow> = {
                        accessorKey: column.id,
                        header: column.label,
                        filterVariant: 'select'
                    }
                    switch (column.type) {
                        case 'CURRENCY':
                            columnObj.muiTableHeadCellProps = { align: 'right' }
                            columnObj.muiTableBodyCellProps = { align: 'right' }
                            columnObj.muiTableFooterCellProps = { align: 'right' }
                            columnObj.filterVariant = 'range'
                            columnObj.Cell = (props) => {
                                const cell = props.cell
                                return (cell.getValue() as number || 0).toLocaleString(userPreferencesResponseJSON.localeString, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })
                            }
                            columnObj.Footer = () => (<Stack>Sum: calculating...</Stack>)
                            columnObj.footerAggregator = 'sum'
                            break
                        case 'FLOAT':
                            columnObj.muiTableHeadCellProps = { align: 'right' }
                            columnObj.muiTableBodyCellProps = { align: 'right' }
                            columnObj.muiTableFooterCellProps = { align: 'right' }
                            columnObj.filterVariant = 'range'
                            columnObj.Footer = () => (<Stack>Sum: calculating...</Stack>)
                            columnObj.Cell = (props) => {
                                const cell = props.cell
                                return (cell.getValue() as number || 0).toLocaleString(userPreferencesResponseJSON.localeString, {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 20,
                                })
                            }
                            columnObj.footerAggregator = 'sum'
                            break
                        case 'INTEGER':
                            columnObj.muiTableHeadCellProps = { align: 'right' }
                            columnObj.muiTableBodyCellProps = { align: 'right' }
                            columnObj.muiTableFooterCellProps = { align: 'right' }
                            columnObj.filterVariant = 'range'
                            columnObj.Footer = () => (<Stack>Count: calculating...</Stack>)
                            columnObj.footerAggregator = 'count'
                            break
                        case 'PERCENT':
                            columnObj.muiTableHeadCellProps = { align: 'right' }
                            columnObj.muiTableBodyCellProps = { align: 'right' }
                            columnObj.muiTableFooterCellProps = { align: 'right' }
                            columnObj.filterVariant = 'range'
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

            let pageNumber = 0

            do {
                const suiteletUrlAPI = utils.getSuiteletUrlForResource({
                    resource: Resource.RunReport,
                    reportId: reportId,
                    variables: variablesResponseJSON,
                    pageNumber,
                })
                console.log('suiteletUrlAPI', suiteletUrlAPI)
                console.log('criteria', criteria)
                const reportResponse = await fetch(suiteletUrlAPI)
                const reportData = await reportResponse.json()
                console.log('returned reportData', reportData)
                if(reportData.length > 0) {
                    await setReportColumnOrder(Object.keys(reportData[0]))
                }
                await setResults(prev => [...prev, ...reportData])
                if(reportData.length < 5000) {
                    abortFetchRef.current = true
                }
                pageNumber++

            } while (!abortFetchRef.current)

            setLoading(false)

        }
        setLoading(true)
        abortFetchRef.current = false
        fetchData()
        // NOTE: Run effect once on component mount, please
        // recheck dependencies if effect is updated.
    }, [])

    const refreshReport = () => {

        const fetchData = async () => {
            let pageNumber = 0

            do {
                const suiteletUrlAPI = utils.getSuiteletUrlForResource({
                    resource: Resource.RunReport,
                    reportId: reportId,
                    variables: criteria,
                    pageNumber,
                })
                console.log('suiteletUrlAPI', suiteletUrlAPI)
                console.log('criteria', criteria)
                const reportResponse = await fetch(suiteletUrlAPI)
                const reportData = await reportResponse.json()
                console.log('returned reportData', reportData)
                if(reportData.length > 0) {
                    await setReportColumnOrder(Object.keys(reportData[0]))
                }
                await setResults(prev => [...prev, ...reportData])
                if(reportData.length < 5000) {
                    abortFetchRef.current = true
                }
                pageNumber++

            } while (!abortFetchRef.current)

            setLoading(false)

        }

        setLoading(true)
        setResults([])
        abortFetchRef.current = false
        fetchData()
    }

    const handleExportDataAsCSV = () => {
        const csvConfig = mkConfig({
            fieldSeparator: userPreferences.csvDelimiter,
            decimalSeparator: userPreferences.csvDecimalDelimiter,
            useKeysAsHeaders: true,
        })
        const csv = generateCsv(csvConfig)(table.getFilteredRowModel().rows.map(row => row.original))
        download(csvConfig)(csv)
    }

    const handleExportDataAsXLSX = async () => {

        const getLength = (variable: string | number | Date): number => {
            switch(typeof variable) {
                case 'string':
                    return variable.length
                case 'number':
                    return Number.isFinite(variable) ? variable.toFixed(2).toString().length : undefined
                case 'object':
                    if (variable instanceof String) {
                        return variable.length
                    } else if (variable instanceof Date) {
                        return variable.toLocaleDateString().length
                    }
                    break
            }
            return 10
        }

        const data = table.getFilteredRowModel().rows.map(row => {
            const { rn, ...rest } = row.original
            return rest
        })
        if (!Array.isArray(data) || data.length === 0) {
            console.error('Invalid or empty data provided.')
            return
        }

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Sheet 1')

        const keys = Object.keys(data[0])

        // Get column headers using the reportColumns map
        const headers = keys.map((key) => {
            return reportColumns.find(col => col.accessorKey === key)?.header || key
        })

        // Add header row
        const headerRow = worksheet.addRow(headers)

        // Style the header row
        headerRow.font = { bold: true }

        // Freeze the header row
        worksheet.views = [{ state: 'frozen', ySplit: 1 }]

        // Enable autofilter
        worksheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: headers.length }
        }

        // Add the data rows
        data.forEach(item => {
            const rowValues = keys.map(key => item[key])
            worksheet.addRow(rowValues)
        })

        // Calculate and set column widths
        const columnWidths = keys.map(key => {
            const maxLen = data.reduce(
                (max, row) => Math.max(max, getLength(row[key]), getLength(reportColumns.find(col => col.accessorKey === key)?.header) || ''),
                key.length
            )
            return { width: Math.min(80, maxLen + 5) } // +3 padding
        })
        console.log('columnWidths:', columnWidths)

        worksheet.columns = columnWidths.map((col, index) => ({
            key: keys[index],
            width: col.width
        }))

        // Generate file and trigger download
        const buffer = await workbook.xlsx.writeBuffer()

        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })

        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'results.xlsx'
        a.click()
        window.URL.revokeObjectURL(url)

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
        columns: memoizedColumns,
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
        muiTableContainerProps: { sx: { maxHeight: 'calc(100vh - 450px)', maxWidth: 'calc(100vw - 50px)' } },
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
        enableStickyFooter: true,
        renderTopToolbarCustomActions: () => (
            <Box
                sx={{
                    display: 'flex',
                    gap: '2px',
                    padding: '8px',
                    flexWrap: 'wrap',
                }}
            >
                <Typography>Download:</Typography>
                <Tooltip title='Download as CSV'>
                    <IconButton onClick={handleExportDataAsCSV}>
                        <DescriptionOutlinedIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title='Download as XLSX'>
                    <IconButton color='success' onClick={handleExportDataAsXLSX}>
                        <TableChartIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
        renderBottomToolbarCustomActions: () => (
            <Box
                sx={{
                    display: 'flex',
                    gap: '8px',
                    padding: '5px',
                    flexWrap: 'wrap',
                }}
            >
                <Typography>
                    Result Count: {results.length}, Filtered Count: {table.getFilteredRowModel().rows.length}
                </Typography>
            </Box>
        ),
    })

    const handleAbortFetch = () => {
        abortFetchRef.current = true
        setLoading(false)
    }

    return (
        <Grid container spacing={2}>
            <FetchingMoreThanLimitDialog
                open={loading}
                id={'fetching-more-than-limit-dialog'}
                fetchedResults={results}
                handleAbortFetch={handleAbortFetch}
            />
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
