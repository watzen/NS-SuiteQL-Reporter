import { TextField }   from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import React, { ReactElement } from 'react'
import { Variable, Variables } from '../../../models/customrecord_wtz_suiteql_report_variable'

type ReportCriteriaType = {
    criteria: Variables,
    handleCriteriaChange: (variableId: string, value: string) => void
}
export const ReportCriteria = (props: ReportCriteriaType) => {

    return (
        <div>
            {Object.keys(props.criteria).map(variableId => {
                const variable = props.criteria[variableId] as Variable
                return (
                    {
                        'DATE': <TextField
                            id={variableId}
                            type='date'
                            variant='standard'
                            label={variable.label}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                const selection = event === null ? null : event.target.valueAsDate
                                props.handleCriteriaChange(variableId, selection?.toISOString().split('T')[0] || '')
                            }}
                            required={true}
                            value={variable.defaultValue}
                        />,
                    }[variable.type] || (
                        <TextField
                            id={variableId}
                            label={variable.label}
                            variant='standard'
                            type='text'
                            required={true}
                            value={variable.defaultValue}
                            onChange={(event) => props.handleCriteriaChange(variableId, event.target.value)}
                        />
                    )
                )
            })}
        </div>
    )
}
