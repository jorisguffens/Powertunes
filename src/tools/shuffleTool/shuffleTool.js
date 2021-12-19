import {useCallback, useState} from "react";
import Typography from "@mui/material/Typography";
import SimpleDialog from "../../common/simpleDialog/simpleDialog";
import {fetchAllTracks, useSpotify} from "../../hooks/spotify";
import {CircularProgress, LinearProgress} from "@mui/material";
import {useQueryClient} from "react-query";
import * as Comlink from 'comlink';
// eslint-disable-next-line import/no-webpack-loader-syntax
import MainWorker from 'worker-loader!../../workers/mainWorker';

export default function ShuffleTool({playlist, handleClose}) {

    const spotify = useSpotify();
    const queryClient = useQueryClient();

    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState(-1);

    const submit = useCallback(async() => {
        if ( progress === 100 ) handleClose();
        if ( busy ) return;
        setBusy(true);

        function onProgressChange(val) {
            setProgress(val);
        }

        const worker = new MainWorker();
        const obj = Comlink.wrap(worker);
        await obj.shuffle(
            Comlink.proxy(fetchAllTracks),
            Comlink.proxy(spotify.removeTracksFromPlaylist),
            Comlink.proxy(spotify.addTracksToPlaylist),
            Comlink.proxy(onProgressChange),
            playlist
        );

        setProgress(100);
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
    }
    else if ( progress === 100 ) {
        dialogContent = (
            <>
                <br/>
                <div align={"center"}>
                    <Typography>Your playlist has been shuffled!</Typography>
                </div>
            </>
        )
    } else {
        dialogContent = (
            <>
                <br/>
                <div align={"center"}>
                    <Typography>Shuffling playlist...</Typography>
                    <br/>
                    {progress === -1 ? (
                        <CircularProgress/>
                    ) : (
                        <LinearProgress variant="determinate" value={progress}/>
                    )}
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