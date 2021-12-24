import SimpleDialog from "../simpleDialog/simpleDialog";
import Typography from "@mui/material/Typography";
import {CircularProgress} from "@mui/material";

export default function ToolDialog(props) {
    const { children, executingText, finishedText } = props;

    let result = children;
    if ( executingText ) {
        result = (
            <div style={{textAlign: "center", marginTop: "20px"}}>
                <Typography>{executingText}</Typography>
                <br/>
                <CircularProgress/>
            </div>
        )
    } else if ( finishedText ) {
        result = (
            <div style={{textAlign: "center", marginTop: "20px"}}>
                <Typography>{finishedText}</Typography>
            </div>
        )
    }

    return (
        <SimpleDialog {...props}>
            {result}
        </SimpleDialog>
    );
}