import {useCallback, useEffect, useState} from "react";
import {useQueryClient} from "react-query";

import {Checkbox, CircularProgress, FormControlLabel, FormGroup, Typography} from "@mui/material";

import {useFetchTracks, useSpotify} from "../../util/spotify";
import SimpleDialog from "../../common/simpleDialog/simpleDialog";
import Track from "../../common/track/track";
import ToolDialog from "../../common/toolDialog/toolDialog";

const keywords = ["cover", "acoustic", "instrumental", "karaoke", "live", "radio edit", "mix"];

export default function ReplaceTool({playlist, handleClose}) {

    const [accepted, setAccepted] = useState(false);
    const [ignoreRemixes, setIgnoreRemixes] = useState(false);
    const [ignoreAcoustic, setIgnoreAcoustic] = useState(false);

    if (accepted) {
        let kw = keywords;
        if (ignoreRemixes) kw = keywords.filter(k => !k.includes("mix"));
        if (ignoreAcoustic) kw = keywords.filter(k => !k.includes("acoustic"));

        return <Replacer playlist={playlist} handleClose={handleClose} keywords={kw}/>
    }

    return (
        <SimpleDialog title={"Replace Tool"} handleClose={handleClose}
                      submitText={"Let's go"} handleSubmit={() => setAccepted(true)}>

            <Typography>
                This tool will look for versions of songs that are not the orginal and replace them with the original.
            </Typography>
            <br/>

            <FormGroup>
                <FormControlLabel label={"Ignore remixes"} control={
                    <Checkbox checked={ignoreRemixes} onChange={() => setIgnoreRemixes(!ignoreRemixes)}/>
                }/>

                <FormControlLabel label={"Ignore acoustic"} control={
                    <Checkbox checked={ignoreAcoustic} onChange={() => setIgnoreAcoustic(!ignoreAcoustic)}/>
                }/>
            </FormGroup>
        </SimpleDialog>
    )
}

function Replacer({playlist, handleClose, keywords}) {

    const spotify = useSpotify();
    const fetchAllTracks = useFetchTracks(playlist);
    const queryClient = useQueryClient();

    const [busy, setBusy] = useState(false);
    const [finished, setFinished] = useState(false);

    const [replacements, setReplacements] = useState(null);
    const [selectedReplacements, setSelectedReplacements] = useState([]);

    useEffect(() => {
        let mounted = true;

        (async () => {
            const tracks = await fetchAllTracks();
            const result = await findReplacements(spotify, tracks, keywords);
            if (!mounted) return;
            setReplacements(result);
            setSelectedReplacements(Object.keys(result));
        })();

        return () => {
            mounted = false;
        }
    }, []);

    const toggle = useCallback((uri) => {
        const index = selectedReplacements.indexOf(uri);
        if (index === -1) {
            selectedReplacements.push(uri);
        } else {
            selectedReplacements.splice(index, 1);
        }
        setSelectedReplacements([...selectedReplacements]);
    }, [selectedReplacements]);

    const handleSubmit = useCallback(async () => {
        if (finished || (replacements && selectedReplacements.length === 0)) {
            handleClose();
            return;
        }

        if (!replacements || busy) return;
        setBusy(true);

        const remove = Object.keys(replacements);
        await spotify.removeTracksFromPlaylist(playlist.id, remove);

        const insert = [...new Set(Object.values(replacements).map(item => item.replacement_uri))];
        await spotify.addTracksToPlaylist(playlist.id, insert);
        setFinished(true);

        await queryClient.invalidateQueries("playlist-" + playlist.id);
    }, [playlist, replacements, selectedReplacements, busy, handleClose, finished]);

    const props = {
        title: "Replace Tool",
        submitText: "Let's go",
        handleClose: handleClose,
        handleSubmit: handleSubmit
    }

    if (finished) {
        props.submitText = "Ok"
        props.finishedText = "Songs have been replaced."
    } else if (!replacements) {
        props.submitText = <CircularProgress size={18}/>
        props.executingText = "Looking for replacements..."
    } else if (busy) {
        props.submitText = <CircularProgress size={18}/>
        props.executingText = "Replacing songs..."
    } else if (Object.keys(replacements).length === 0) {
        props.submitText = "Ok"
        props.finishedText = "No songs (or replacements) found."
    } else {
        if (selectedReplacements.length === 0) {
            props.handleSubmit = null;
        }
        const items = [];
        for (let uri of Object.keys(replacements)) {
            const item = replacements[uri];
            const checkbox = <Checkbox checked={selectedReplacements.indexOf(uri) !== -1}
                                       defaultValue={true} onChange={() => toggle(uri)}/>
            items.push(<FormControlLabel key={uri} label={<Track data={item.remix_track}/>}
                                         disableTypography={true} style={{marginBottom: '10px', maxWidth: "100%"}}
                                         control={checkbox}/>
            )
        }
        props.children = (
            <>
                <Typography>
                    Select the songs you want to replace.
                </Typography>
                <br/>
                <FormGroup>
                    {items}
                </FormGroup>
            </>
        )
    }

    return <ToolDialog {...props}/>
}

async function findReplacements(spotify, tracks, keywords) {
    const replacements = {};
    for (let i = 0; i < tracks.length; i++) {
        const item = tracks[i];
        const name = item.track.name;

        if (!keywords.some(keyword => name.toLowerCase().includes(keyword))) {
            continue;
        }

        const artists = item.track.artists.map(artist => artist.uri);
        let query = name.split("-")[0].trim();
        query = query.replace(/ *\[[^\]]*]/, ''); // remove text between [] square brackets

        // keyword appears in name of song, ignore
        if (keywords.some(keyword => query.toLowerCase().includes(keyword))) {
            continue;
        }

        const result = await spotify.searchTracks(query, {
            limit: 20
        });

        let items = result.tracks.items
            .filter(i =>
                i.uri !== item.track.uri &&
                !i.name.includes("-")
            );

        const nameLower = name.toLowerCase();
        if (nameLower.includes("mix")
            || nameLower.includes("radio edit")
            || nameLower.includes("live")) {
            // check if artists are included
            items = items.filter(i => i.artists.map(a => a.uri).some(a => artists.includes(a)));
        }

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