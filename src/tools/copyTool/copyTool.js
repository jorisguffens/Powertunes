import {useCallback, useState} from "react";

import {
    Box,
    Checkbox,
    Chip,
    CircularProgress,
    FormControl,
    FormGroup,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    TextField,
    Typography
} from "@mui/material";
import {fetchAllTracks, usePlaylists, useSpotify, useUser} from "../../util/spotify";
import {useQueryClient} from "react-query";
import ToolDialog from "../../common/toolDialog/toolDialog";

export default function CopyTool({handleClose}) {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const spotify = useSpotify();
    const queryClient = useQueryClient();

    const {data: user} = useUser();
    const {data: playlists} = usePlaylists();
    const [selectedPlaylists, setSelectedPlaylists] = useState([]);

    const [busy, setBusy] = useState(false);
    const [finished, setFinished] = useState(false);

    const handleSubmit = useCallback(async () => {
        if ( finished ) {
            handleClose();
        }
        if ( busy) return;
        setBusy(true);

        const result = await spotify.createPlaylist(user.id, {
            name: name,
            description: description,
            public: false,
        });

        const totalTracks = [];
        for ( let i = 0; i < selectedPlaylists.length; i++ ) {
            const uri = selectedPlaylists[i];
            const playlist = playlists.items.filter(p => p.uri === uri)[0];
            const tracks = await fetchAllTracks(spotify, playlist);
            tracks.forEach(t => totalTracks.push(t.track.uri));
        }

        for ( let i = 0; i < totalTracks.length; i += 100 ) {
            const tracks = totalTracks.slice(i, Math.min(i + 100, totalTracks.length));
            await spotify.addTracksToPlaylist(result.id, tracks);
        }
        setFinished(true);

        await queryClient.invalidateQueries("playlists");
    }, [busy, handleClose, name, description, selectedPlaylists, playlists, finished]);

    const props = {
        title: "Copy Tool",
        submitText: "Let's go",
        handleClose: handleClose,
        handleSubmit: handleSubmit
    }

    if ( finished ) {
        props.submitText = "Ok"
        props.finishedText = "Playlists have been copied into a single playlist";
    } else if ( busy ) {
        props.submitText = <CircularProgress size={18}/>
        props.executingText = "Merging playlists..."
    } else {
        if ( !name || selectedPlaylists.length === 0) {
            props.handleSubmit = null;
        }
        props.children = (
            <>
                <Typography>
                    Copy multiple playlists into a single new playlist.
                </Typography>
                <br/>
                <FormGroup>
                    <TextField variant={"outlined"} label={"Name"} fullWidth value={name}
                               onChange={(e) => setName(e.target.value)}
                    />
                    <br/>

                    <TextField variant={"outlined"} label={"Description"} fullWidth value={description}
                               onChange={(e) => setDescription(e.target.value)}
                    />
                    <br/>

                    <FormControl>
                        <InputLabel>Select playlists</InputLabel>
                        <Select multiple value={selectedPlaylists} fullWidth
                                onChange={(e) => setSelectedPlaylists(e.target.value)}
                                input={<OutlinedInput label={"Select playlists"}/>}
                                renderValue={(selected) => (
                                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                        {selected.map((value) => playlists.items.filter(i => i.uri === value)[0].name)
                                            .map(value => (
                                                <Chip key={value} label={value}/>
                                            ))}
                                    </Box>
                                )}
                        >
                            {playlists.items.map((item) => (
                                <MenuItem key={item.uri} value={item.uri}>
                                    <Checkbox checked={selectedPlaylists.indexOf(item.uri) > -1}/>
                                    <ListItemText primary={item.name}/>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </FormGroup>
            </>
        )
    }

    return <ToolDialog {...props}/>
}