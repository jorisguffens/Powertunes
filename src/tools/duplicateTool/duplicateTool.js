import {useCallback, useEffect, useState} from "react";
import {useQueryClient} from "react-query";

import {CircularProgress, Typography} from "@mui/material";

import {useFetchTracks, useSpotify} from "../../util/spotify";
import Track from "../../common/track/track";
import SimpleDialog from "../../common/simpleDialog/simpleDialog";
import ToolDialog from "../../common/toolDialog/toolDialog";

export default function DuplicateTool({playlist, handleClose}) {

    const [accepted, setAccepted] = useState(false);

    if (accepted) {
        return <DuplicateFinder handleClose={handleClose} playlist={playlist}/>
    }

    return (
        <SimpleDialog title={"Duplicate Tool"} handleClose={handleClose}
                      submitText={"Let's go"} handleSubmit={() => setAccepted(true)}>

            <Typography>
                This tool will look for duplicated songs and remove the duplicates.
                <br/><br/>
                After running this tool, the fixed songs will appear at the end of the playlist.
            </Typography>
            <br/>
        </SimpleDialog>
    )
}

function DuplicateFinder({playlist, handleClose}) {

    const spotify = useSpotify();
    const fetchAllTracks = useFetchTracks(playlist);
    const queryClient = useQueryClient();

    const [busy, setBusy] = useState(false);
    const [finished, setFinished] = useState(false);
    const [duplicates, setDuplicates] = useState(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            const tracks = await fetchAllTracks();
            const result = await findDuplicates(tracks);
            if ( !mounted ) return;
            setDuplicates(result);
        })();

        return () => {
            mounted = false;
        }
    }, [playlist]);

    const handleSubmit = useCallback(async () => {
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
        setFinished(true);

        await queryClient.invalidateQueries("playlist-" + playlist.id);
    }, [duplicates, busy, handleClose, playlist, queryClient, spotify]);

    const props = {
        title: "Duplicate Tool",
        submitText: "Let's go",
        handleClose: handleClose,
        handleSubmit: handleSubmit
    }

    if ( finished ) {
        props.submitText = "Ok"
        props.executingText = "Duplicates have been removed";
    } else if (!duplicates) {
        props.submitText = <CircularProgress size={18}/>
        props.executingText = "Looking for duplicates..."
    } else if (busy) {
        props.submitText = <CircularProgress size={18}/>
        props.executingText = "Removing duplicates..."
    } else if (Object.keys(duplicates).length === 0) {
        props.submitText = "Ok"
        props.finishedText = "No duplicates found."
    } else {
        props.children = Object.keys(duplicates).map((uri) => {
            const data = duplicates[uri];
            return (
                <div key={uri} style={{display: 'flex', alignItems: 'center'}}>
                    <div style={{marginRight: "10px", fontSize: "18px", minWidth: "40px"}}>
                        {data.count}&nbsp;x
                    </div>
                    <Track data={data.track}/>
                </div>
            )
        })
    }

    return <ToolDialog {...props}/>
}

async function findDuplicates(tracks) {
    const duplicates = {};
    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i].track;
        if (duplicates[track.uri]) {
            duplicates[track.uri].count++;
            continue;
        }

        // look for the same song but in a different album, so name & artists must match
        const artists = JSON.stringify(track.artists.map(a => a.uri));
        for (let dup of Object.values(duplicates)) {
            if (dup.track.name === track.name &&
                JSON.stringify(dup.track.artists.map(a => a.uri)) === artists) {
                const item = duplicates[dup.track.uri];
                item.count++;
                item.remove = [...item.remove, track.uri];
                break;
            }
        }

        duplicates[track.uri] = {
            count: 1,
            track: track,
            remove: [track.uri]
        }
    }

    for (let uri of Object.keys(duplicates)) {
        if (duplicates[uri].count <= 1) {
            delete duplicates[uri];
        }
    }

    return duplicates;
}