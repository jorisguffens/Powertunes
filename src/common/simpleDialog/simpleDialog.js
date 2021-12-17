import {Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import Button from "@mui/material/Button";

export default function SimpleDialog({children, title, handleClose, submitText, handleSubmit}) {
    return (
        <Dialog open={true} fullWidth maxWidth={"xs"}>
            <DialogTitle>
                {title}
            </DialogTitle>
            <DialogContent>
                {children}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit}>
                    {submitText}
                </Button>
            </DialogActions>
        </Dialog>
    )
}