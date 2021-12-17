import {useQueryClient} from "react-query";
import {useCallback, useEffect, useState} from "react";
import Typography from "@mui/material/Typography";
import SimpleDialog from "../../common/simpleDialog/simpleDialog";
import {spotify} from "../../hooks/spotify";
import {Checkbox, CircularProgress, FormControlLabel, FormGroup} from "@mui/material";
import Track from "../../common/track/track";


export default function RemixTool({playlist, handleClose}) {

    const [accepted, setAccepted] = useState(false);

    return (
        <>
            {!accepted ? (
                <SimpleDialog title={"Replace remixes"} handleClose={handleClose}
                              submitText={"Let's go"} handleSubmit={() => setAccepted(true)}>

                    <Typography>
                        This tool will look for remixed songs in your playlist and try to replace them with the
                        original version.
                    </Typography>
                </SimpleDialog>
            ) : (
                <ReplacementDialog playlist={playlist} handleClose={handleClose}/>
            )}
        </>
    )
}

function ReplacementDialog({playlist, handleClose}) {
    const queryClient = useQueryClient();

    const [busy, setBusy] = useState(false);

    const [replacements, setReplacements] = useState(null);
    const [selectedReplacements, setSelectedReplacements] = useState([]);

    useEffect(() => {
        let mounted = true;
        findReplacements(playlist).then((replacements) => {
            if (!mounted) return;
            setSelectedReplacements(Object.keys(replacements));
            setReplacements(replacements);
        })
        return () => {
            mounted = false;
        }
    }, [playlist]);

    const toggle = useCallback((uri) => {
        const index = selectedReplacements.indexOf(uri);
        if (index === -1) {
            selectedReplacements.push(uri);
        } else {
            selectedReplacements.splice(index, 1);
        }
        setSelectedReplacements([...selectedReplacements]);
    }, [replacements]);

    const submit = useCallback(async () => {
        if (!replacements || busy) return;
        if (selectedReplacements.length === 0) {
            handleClose();
            return;
        }
        setBusy(true);

        const remove = Object.keys(replacements);
        await spotify.removeTracksFromPlaylist(playlist.id, remove);

        const insert = [...new Set(Object.values(replacements).map(item => item.replacement_uri))];
        await spotify.addTracksToPlaylist(playlist.id, insert);
        handleClose();
        await queryClient.invalidateQueries("playlist-" + playlist.id);
    }, [replacements, selectedReplacements]);

    let dialogContent = null;
    if (!replacements) {
        dialogContent = (
            <>
                <br/>
                <div align={"center"}>
                    <Typography>Looking for remixes...</Typography>
                    <br/>
                    <CircularProgress/>
                </div>
            </>
        );
    } else if (busy) {
        dialogContent = (
            <>
                <br/>
                <div align={"center"}>
                    <Typography>Replacing remixes...</Typography>
                    <br/>
                    <CircularProgress/>
                </div>
            </>
        );
    } else if (Object.keys(replacements).length === 0) {
        dialogContent = (
            <>
                <br/>
                <Typography align={"center"}>
                    No remixes (or replacements) were found.
                </Typography>
            </>
        )
    } else {
        dialogContent = (
            <>
                <Typography>
                    Select the songs you want to replace.
                </Typography>
                <br/>
                <FormGroup>
                    {Object.keys(replacements).map((uri) => {
                        const item = replacements[uri];
                        return (
                            <FormControlLabel key={uri}
                                              label={<Track data={item.remix_track}/>}
                                              disableTypography={true}
                                              style={{marginBottom: '10px', maxWidth: "100%"}}
                                              control={
                                                  <Checkbox checked={selectedReplacements.indexOf(uri) !== -1}
                                                            defaultValue={true}
                                                            onChange={() => toggle(uri)}/>
                                              }/>
                        )
                    })}
                </FormGroup>
            </>
        )
    }

    return (
        <SimpleDialog title={"Replace remixes"} handleClose={handleClose}
                      submitText={"Accept"} handleSubmit={submit}>
            {dialogContent}
        </SimpleDialog>
    )
}

async function findReplacements(playlist) {
    const trackItems = playlist.tracks.items;
    if (trackItems.length < playlist.tracks.total) {
        console.log("Not all tracks are loaded");
        return;
    }

    const replacements = {};
    for (let i = 0; i < trackItems.length; i++) {
        const item = trackItems[i];
        const name = item.track.name;
        if (!name.toLowerCase().includes("remix")) {
            continue;
        }

        const artists = item.track.artists.map(artist => artist.name)
            .filter(artist => !name.includes(artist));
        const query = name.split("-")[0].trim() + " " + artists.join(", ");
        const result = await spotify.searchTracks(query, {
            limit: 10
        });

        const items = result.tracks.items.filter(i => i.uri !== item.track.uri && i.name !== item.track.name);
        if (items.length === 0) {
            console.log("No replacement found for " + name);
            continue;
        }

        replacements[item.track.uri] = {
            replacement_uri: items[0].uri,
            remix_track: item.track
        };
    }
    return replacements;
}