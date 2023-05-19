import { Paper } from '@mui/material'
import Grid from '@mui/material/Grid'
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table'
import React, { useCallback, useEffect, useState } from 'react'
import { Column } from '../../../scripts/reporter api suitelet/column-getter/index'
import { Resource } from '../constants'
import useFetch from '../customHooks/useFetch'
import { UserPreferences } from '../types'
import utils from '../utils/utils'

type ReportRow = {
    [column: string]: string | number | boolean | Date | null
}

const ReportViewer = (): JSX.Element => {

    const urlParams = new URLSearchParams(window.location.search)
    const reportId = parseInt(urlParams.get('id') as string, 10)

    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<ReportRow[]>([])

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

            const suiteletUrlGetColumns = utils.getSuiteletUrlForResource({
                resource: Resource.GetColumns,
                reportId: reportId,
            })
            const columnsResponse = await fetch(suiteletUrlGetColumns)
            const columnsData = await columnsResponse.json() as Column[]
            console.log('returned columnsData', columnsData)

            if(columnsData.length > 0) {
                const columnDefinitions = columnsData.map(column => {
                    let align = 'left'
                    let cellFn: (props: any) => {}
                    switch (column.type) {
                        case 'CURRENCY':
                            align = 'right'
                            cellFn = (props) => {
                                const cell = props.cell
                                return cell.getValue().toLocaleString(userPreferencesResponseJSON.localeString)
                            }
                            break
                        case 'FLOAT':
                            align = 'right'
                            break
                        case 'INTEGER':
                            align = 'right'
                            break
                        case 'PERCENT':
                            align = 'right'
                            break
                    }


                    return {
                        accessorKey: column.id,
                        header: column.label,
                        muiTableHeadCellProps: { align: align },
                        muiTableBodyCellProps: { align: align },
                        Cell: cellFn,
                        //accessorFn: (originalRow) => originalRow.age, //alternate way
                        //id: column, //id required if you use accessorFn instead of accessorKey
                        //Header: <i style={{ color: 'red' }}>Age</i>, //optional custom markup
                        //muiTableHeadCellProps: { style: { color: 'green' } }, //custom props
                    }

                })
                await setReportColumns(columnDefinitions)
            }

            const suiteletUrlAPI = utils.getSuiteletUrlForResource({
                resource: Resource.RunReport,
                reportId: reportId,
            })
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
        muiTableContainerProps: { sx: { maxHeight: 'calc(100vh - 300px)', maxWidth: 'calc(100vw - 50px)' } },
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
        enableColumnResizing: false,
        columnResizeMode: 'onChange', //default
        enableRowSelection: false, //enable some features
        enablePagination: false,
        enableRowVirtualization: true,
        //enableColumnOrdering: true,
        //enableColumnDragging: true,
        enableGlobalFilter: true, //turn off a feature
        enableBottomToolbar: false,
    })


    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Paper elevation={3}>
                    <MaterialReactTable table={table} />
                </Paper>
            </Grid>
        </Grid>
    )
}

export default ReportViewer
