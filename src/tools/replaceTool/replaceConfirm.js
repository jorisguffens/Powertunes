import {useQueryClient} from "react-query";
import {useCallback, useEffect, useState} from "react";
import {findReplacements, spotify} from "../../hooks/spotify";
import Typography from "@mui/material/Typography";
import {Checkbox, CircularProgress, FormControlLabel, FormGroup} from "@mui/material";
import Track from "../../common/track/track";
import SimpleDialog from "../../common/simpleDialog/simpleDialog";

export default function ReplaceConfirm({ playlist, handleClose, keywords }) {
    const queryClient = useQueryClient();

    const [busy, setBusy] = useState(false);

    const [replacements, setReplacements] = useState(null);
    const [selectedReplacements, setSelectedReplacements] = useState([]);

    useEffect(() => {
        let mounted = true;
        findReplacements(playlist, keywords).then((replacements) => {
            if (!mounted) return;
            setSelectedReplacements(Object.keys(replacements));
            setReplacements(replacements);
        })
        return () => {
            mounted = false;
        }
    }, [playlist, keywords]);

    const toggle = useCallback((uri) => {
        const index = selectedReplacements.indexOf(uri);
        if (index === -1) {
            selectedReplacements.push(uri);
        } else {
            selectedReplacements.splice(index, 1);
        }
        setSelectedReplacements([...selectedReplacements]);
    }, [selectedReplacements]);

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
    }, [replacements, selectedReplacements, busy, handleClose, playlist, queryClient]);

    let dialogContent;
    if (!replacements) {
        dialogContent = (
            <>
                <br/>
                <div align={"center"}>
                    <Typography>Looking for songs...</Typography>
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
                    <Typography>Replacing songs...</Typography>
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
                    No songs (or replacements) found.
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
        <SimpleDialog title={"Replace Tool"} handleClose={handleClose}
                      submitText={"Accept"} handleSubmit={submit}>
            {dialogContent}
        </SimpleDialog>
    )
}