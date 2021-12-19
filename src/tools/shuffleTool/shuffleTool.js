import {useCallback, useState} from "react";
import Typography from "@mui/material/Typography";
import SimpleDialog from "../../common/simpleDialog/simpleDialog";
import {cryptoShuffle, useSpotify} from "../../hooks/spotify";
import {CircularProgress} from "@mui/material";
import {useQueryClient} from "react-query";

export default function ShuffleTool({playlist, handleClose}) {

    const spotify = useSpotify();
    const queryClient = useQueryClient();
    const [busy, setBusy] = useState(false);

    const submit = useCallback(async () => {
        if ( busy ) return;
        setBusy(true);

        console.log("shuffling...");
        await cryptoShuffle(playlist);

        handleClose();
        await queryClient.invalidateQueries("playlist-" + playlist.id);
    }, [busy, handleClose, playlist, queryClient, spotify]);

    let dialogContent;
    if ( !busy ) {
        dialogContent = (
            <>
                <Typography>
                    This tool will shuffle your playlist with cryptographical randomness.
                </Typography>
                <br/>
            </>
        )
    } else {
        dialogContent = (
            <>
                <br/>
                <div align={"center"}>
                    <Typography>Shuffling playlist...</Typography>
                    <br/>
                    <CircularProgress/>
                </div>
            </>
        )
    }

    return (
        <>
            <SimpleDialog title={"Shuffle Tool"} handleClose={handleClose}
                          submitText={"Let's go"} handleSubmit={submit}>
                {dialogContent}
            </SimpleDialog>
        </>
    )
}