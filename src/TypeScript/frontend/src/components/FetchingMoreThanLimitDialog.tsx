import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import * as React from 'react'


type FetchingMoreThanLimitDialogProps = {
    open: boolean
    id: string
    fetchedResults: any[]
    handleAbortFetch: () => void
}

export const FetchingMoreThanLimitDialog = (props: FetchingMoreThanLimitDialogProps) => {
    return <React.Fragment>
        <Dialog
            fullWidth={false}
            maxWidth={false}
            open={props.open}
        >
            <DialogTitle>Fetching results</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Fetching rows {props.fetchedResults.length} to {props.fetchedResults.length+5000}. Please wait or click "Abort" to stop fetching.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleAbortFetch}>Abort</Button>
            </DialogActions>
        </Dialog>
    </React.Fragment>
}
