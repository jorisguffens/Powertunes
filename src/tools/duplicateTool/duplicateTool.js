import {useEffect, useState} from "react";
import Typography from "@mui/material/Typography";
import SimpleDialog from "../../common/simpleDialog/simpleDialog";

export default function DuplicateTool({playlist, handleClose}) {

    const [accepted, setAccepted] = useState(false);

    return (
        <>
            {!accepted ? (
                <SimpleDialog title={"Magic Tool"} handleClose={handleClose}
                              submitText={"Let's go"} handleSubmit={() => setAccepted(true)}>

                    <Typography>
                        This tool will look for duplicated songs and remove the duplicates.
                    </Typography>
                    <br/>
                </SimpleDialog>
            ) : (
                <DuplicateFinder handleClose={handleClose} playlist={playlist}/>
            )}
        </>
    )
}

function DuplicateFinder({playlist, handleClose}) {

    const [duplicates, setDuplicates] = useState(null);

    useEffect(() => {
        let mounted = true;
        // TODO
        return () => {
            mounted = false;
        }
    }, [playlist]);

}