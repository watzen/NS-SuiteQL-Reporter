import { createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material'
import React, { ReactElement } from 'react'
import ReportViewer from './components/ReportViewer'
import './index.css'

const theme = createTheme({
    components: {
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    fontSize: '14px',
                    maxWidth: 500,
                }
            }
        }
    }
})

const App = (): ReactElement => {
    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <ReportViewer />
            </ThemeProvider>
        </StyledEngineProvider>
    )
}

export default App
