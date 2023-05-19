import 'core-js/stable'
import 'regenerator-runtime/runtime'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('root')
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const root = createRoot(container!)
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    )
})

if(module.hot) {
    module.hot.accept('./App', () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const NextApp = require('./App').default
        const container = document.getElementById('root')
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const root = createRoot(container!)
        root.render(
            <React.StrictMode>
                <NextApp />
            </React.StrictMode>
        )
    })
}
