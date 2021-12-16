import {Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup} from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import replaceRemixes from "./programs/replaceRemixes";
import {useState} from "react";
import {useQueryClient} from "react-query";
import {useSpotify} from "../../../hooks/spotify";

const programs = {
    "replace-remixes": {
        name: "Replace remixes",
        script: replaceRemixes
    },
    "replace-covers": {
        name: "Replace covers"
    },
    "replace-instrumental": {
        name: "Replace instrumental versions"
    },
    "shuffle": {
        name: "Shuffle playlist"
    }
}

export default function MagicTool({playlist, handleClose}) {

    const queryClient = useQueryClient();

    const [busy, setBusy] = useState(false);
    const [selectedPrograms, setSelectedPrograms] = useState([]);

    function toggle(key) {
        const index = selectedPrograms.indexOf(key);
        if ( index === -1 ) {
            selectedPrograms.push(key);
        } else {
            selectedPrograms.slice(index, 1);
        }
        setSelectedPrograms([...selectedPrograms]);
    }

    async function run() {
        if ( busy ) return;
        setBusy(true);

        let snapshot_id;
        for ( let key of selectedPrograms ) {
            if ( programs[key].script ) {
                snapshot_id = await programs[key].script(playlist);
            }
        }

        await queryClient.invalidateQueries("playlist-" + playlist.id);
        setBusy(false);
    }

    return (
        <Dialog open>
            <DialogTitle>
                Magic Tool
            </DialogTitle>
            <DialogContent>
                <Typography>
                    The magic tool can run multiple programs at once on your playlist. Choose programs te execute below.
                </Typography>
                <br/>

                <FormGroup>
                    {Object.keys(programs).map((key, i) => {
                        const data = programs[key];
                        return (
                            <FormControlLabel key={i} label={data.name} control={
                                <Checkbox value={selectedPrograms.indexOf(key) !== 0}
                                          onClick={() => toggle(key)}/>
                            }/>
                        )
                    })}
                </FormGroup>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={busy}>
                    Cancel
                </Button>
                <Button onClick={run} disabled={busy}>
                    Let's go
                </Button>
            </DialogActions>
        </Dialog>

    )
}