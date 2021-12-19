import {useCallback, useEffect, useState} from "react";
import Typography from "@mui/material/Typography";
import SimpleDialog from "../../common/simpleDialog/simpleDialog";
import {findDuplicates, useSpotify} from "../../hooks/spotify";
import {CircularProgress} from "@mui/material";
import Track from "../../common/track/track";
import {useQueryClient} from "react-query";

export default function DuplicateTool({playlist, handleClose}) {

    const [accepted, setAccepted] = useState(false);

    return (
        <>
            {!accepted ? (
                <SimpleDialog title={"Duplicate Tool"} handleClose={handleClose}
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

    const spotify = useSpotify();
    const queryClient = useQueryClient();

    const [busy, setBusy] = useState(false);
    const [duplicates, setDuplicates] = useState(null);

    useEffect(() => {
        let mounted = true;
        findDuplicates(playlist).then(duplicates => {
            if ( !mounted ) return;
            setDuplicates(duplicates);
        })
        return () => {
            mounted = false;
        }
    }, [playlist]);

    const submit = useCallback(async () => {
        if (!duplicates || busy) return;
        if (Object.keys(duplicates).length === 0) {
            handleClose();
            return;
        }
        setBusy(true);

        const remove = Object.values(duplicates).flatMap(dup => dup.remove);
        await spotify.removeTracksFromPlaylist(playlist.id, remove);

        const insert = Object.keys(duplicates);
        await spotify.addTracksToPlaylist(playlist.id, insert);

        handleClose();
        await queryClient.invalidateQueries("playlist-" + playlist.id);
    }, [duplicates, busy, handleClose, playlist, queryClient, spotify]);

    let dialogContent;
    if (!duplicates) {
        dialogContent = (
            <>
                <br/>
                <div align={"center"}>
                    <Typography>Looking for duplicates...</Typography>
                    <br/>
                    <CircularProgress/>
                </div>
            </>
        );
    } else if ( busy ) {
        dialogContent = (
            <>
                <br/>
                <div align={"center"}>
                    <Typography>Removing duplicates...</Typography>
                    <br/>
                    <CircularProgress/>
                </div>
            </>
        );
    } else if ( Object.keys(duplicates).length === 0 ) {
        dialogContent = (
            <>
                <br/>
                <Typography align={"center"}>
                    No duplicate songs found.
                </Typography>
            </>
        )
    } else {
        dialogContent = (
            <>
                {Object.keys(duplicates).map((uri) => {
                    const data = duplicates[uri];
                    return (
                        <div key={uri} style={{display: 'flex', alignItems: 'center'}}>
                            <div style={{marginRight: "20px", fontSize: "18px"}}>
                                {data.count}&nbsp; x
                            </div>
                            <Track data={data.track}/>
                        </div>
                    )
                })}
            </>
        )
    }

    return (
        <SimpleDialog title={"Duplicate Tool"} handleClose={handleClose}
                      submitText={"Let's go"} handleSubmit={submit}>
            {dialogContent}
        </SimpleDialog>
    )
}