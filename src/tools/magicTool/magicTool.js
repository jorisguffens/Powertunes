import {useCallback, useState} from "react";
import Typography from "@mui/material/Typography";
import SimpleDialog from "../../common/simpleDialog/simpleDialog";
import ReplacementTool from "../replacementTool/replacementTool";
import {Checkbox, FormControlLabel, FormGroup} from "@mui/material";
import Track from "../../common/track/track";

const programs = {
    "remix": "Remixes",
    "cover": "Covers",
    "acoustic": "Acoustic songs",
    "instrumental": "Instrumental songs",
    "karaoke": "Karaoke versions"
}

export default function MagicTool({playlist, handleClose}) {

    const [accepted, setAccepted] = useState(false);
    const [keywords, setKeywords] = useState(Object.keys(programs));

    const toggle = useCallback((keyword) => {
        const index = keywords.indexOf(keyword);
        if (index === -1) {
            keywords.push(keyword);
        } else {
            keywords.splice(index, 1);
        }
        setKeywords([...keywords]);
    }, []);

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
                        {Object.keys(programs).map((keyword) => {
                            return (
                                <FormControlLabel key={keyword}
                                                  label={programs[keyword]}
                                                  control={
                                                      <Checkbox checked={keywords.indexOf(keyword) !== -1}
                                                                onChange={() => toggle(keyword)}/>
                                                  }/>
                            )
                        })}
                    </FormGroup>
                </SimpleDialog>
            ) : (
                <ReplacementTool playlist={playlist} handleClose={handleClose}
                                 title={"Magic Tool"} keyword={keywords}
                                 lookingText={"Looking for songs..."}
                                 replacingText={"Replacing songs..."}
                                 emptyText={"No songs (or replacements) found."}
                />
            )}
        </>
    )
}