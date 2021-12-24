import {useCallback, useState} from "react";
import {useQueryClient} from "react-query";

import {CircularProgress, Typography} from "@mui/material";

import {useFetchTracks, useSpotify} from "../../util/spotify";
import ToolDialog from "../../common/toolDialog/toolDialog";

export default function ShuffleTool({playlist, handleClose}) {

    const spotify = useSpotify();
    const fetchAllTracks = useFetchTracks(playlist);
    const queryClient = useQueryClient();

    const [busy, setBusy] = useState(false);
    const [finished, setFinished] = useState(false);

    const handleSubmit = useCallback(async() => {
        if ( finished ) {
            handleClose();
        }
        if ( busy ) return;
        setBusy(true);

        const tracks = await fetchAllTracks();
        arrayShuffle(tracks);

        for (let offset = 0; offset < tracks.length; offset += 100) {
            const length = Math.min(100, tracks.length - offset)
            const uris = tracks.slice(offset, offset + length).map(i => i.track.uri);
            await spotify.removeTracksFromPlaylist(playlist.id, uris);
            await spotify.addTracksToPlaylist(playlist.id, uris);
        }

        setFinished(true);
        await queryClient.invalidateQueries("playlist-" + playlist.id);
    }, [busy, playlist, finished]);

    const props = {
        title: "Duplicate Tool",
        submitText: "Let's go",
        handleClose: handleClose,
        handleSubmit: handleSubmit
    }

    if ( finished ) {
        props.submitText = "Ok"
        props.executingText = "Playlist has been shuffled";
    } else if (busy) {
        props.submitText = <CircularProgress size={18}/>
        props.executingText = "Shuffling playlist..."
    } else {
        props.children = (
            <>
                <Typography>
                    This tool will shuffle your playlist with the&nbsp;
                    <a href="https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle"
                       target={"_blank"} rel="noreferrer noopener">
                        Fisher-Yate Shuffle Algorithm
                    </a>, which garantees a very good randomness.
                </Typography>
                <br/>
            </>
        )
    }

    return <ToolDialog {...props}/>
}

function arrayShuffle(array) {
    let m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);

        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}