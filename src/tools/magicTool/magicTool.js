import {useCallback, useState} from "react";
import Typography from "@mui/material/Typography";
import SimpleDialog from "../../common/simpleDialog/simpleDialog";
import ReplacementTool from "../replacementTool/replacementTool";
import {Checkbox, FormControlLabel, FormGroup} from "@mui/material";

const programs = {
    "Remixes": ["remix", "mix"],
    "Covers": ["cover"],
    "Acoustic songs": ["acoustic"],
    "Instrumental songs": ["instrumental"],
    "Karaoke versions": ["karaoke"],
    "Live versions": ["live"],
    "Radio edits": ["radio edit"]
}

export default function MagicTool({playlist, handleClose}) {

    const [accepted, setAccepted] = useState(false);
    const [selectedPrograms, setSelectedPrograms] = useState(Object.keys(programs));

    const toggle = useCallback((program) => {
        const index = selectedPrograms.indexOf(program);
        if (index === -1) {
            selectedPrograms.push(program);
        } else {
            selectedPrograms.splice(index, 1);
        }
        setSelectedPrograms([...selectedPrograms]);
    }, [selectedPrograms]);

    return (
        <>
            {!accepted ? (
                <SimpleDialog title={"Magic Tool"} handleClose={handleClose}
                              submitText={"Let's go"} handleSubmit={() => setAccepted(true)}>

                    <Typography>
                        This tool will look for versions of songs that are not the orginal and replace them with the original.
                    </Typography>
                    <br/>

                    <FormGroup>
                        {Object.keys(programs).map((program) => {
                            return (
                                <FormControlLabel key={program}
                                                  label={program}
                                                  control={
                                                      <Checkbox checked={selectedPrograms.indexOf(program) !== -1}
                                                                onChange={() => toggle(program)}/>
                                                  }/>
                            )
                        })}
                    </FormGroup>
                </SimpleDialog>
            ) : (
                <ReplacementTool playlist={playlist} handleClose={handleClose}
                                 title={"Magic Tool"} keyword={selectedPrograms.flatMap(program => programs[program])}
                                 lookingText={"Looking for songs..."}
                                 replacingText={"Replacing songs..."}
                                 emptyText={"No songs (or replacements) found."}
                />
            )}
        </>
    )
}