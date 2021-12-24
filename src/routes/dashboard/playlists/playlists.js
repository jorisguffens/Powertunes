import {usePlaylists, useSpotify, useUser} from "../../../util/spotify";
import Typography from "@mui/material/Typography";
import {Card, CardContent, Divider, IconButton, Skeleton} from "@mui/material";

import style from "./playlists.module.scss";
import {Link} from "react-router-dom";
import Button from "@mui/material/Button";
import {useCallback, useState} from "react";
import CopyTool from "../../../tools/copyTool/copyTool";
import {useQueryClient} from "react-query";

export default function Playlists() {

    const {data: playlists} = usePlaylists();
    const {data: user} = useUser();

    const [copyTool, setCopyTool] = useState(false);

    let view = [];
    if (playlists) {
        for (let playlist of playlists.items) {
            if ( playlist.owner.uri !== user.uri && !playlist.collaborative ) {
                continue;
            }
            view.push(<Playlist key={playlist.id} data={playlist}/>);
        }
    } else {
        view = (
            <>
                <Skeleton height={40} variant={"rectangular"}/><br/>
                <Skeleton height={40} variant={"rectangular"}/>
            </>
        )
    }

    return (
        <>
            <Typography variant={"h2"}>Your playlists</Typography>
            <br/>
            <div className={style.toolButtons}>
                <Button onClick={() => setCopyTool(true)}>
                    Copy Tool
                </Button>
            </div>
            <Divider/>
            <br/>
            {view}

            {copyTool && <CopyTool handleClose={() => setCopyTool(false)}/>}
        </>
    );
}

function Playlist({data}) {

    // smallest image (60x60)
    const image = data.images.sort((a, b) => a.height - b.height)[0];
    return (
        <Link to={"/playlist/" + data.id} className={style.link}>
            <Card className={style.item}>
                <CardContent className={style.itemContent}>
                    <div className={style.itemImage}>
                        {image ? (
                            <img src={image.url} alt=""/>
                        ) : (
                            <div style={{width: "40px", height: "40px", background: "#555"}}/>
                        )}
                    </div>
                    <div className={style.itemInfo}>
                        <Typography>
                            {data.name}
                        </Typography>
                        <Typography>
                            {data.description}
                        </Typography>
                    </div>
                    {/*<div className={style.itemActions}>*/}
                    {/*    <IconButton title={"Remove playlist"}>*/}
                    {/*        <i className="fas fa-trash"/>*/}
                    {/*    </IconButton>*/}
                    {/*</div>*/}
                </CardContent>
            </Card>
        </Link>
    );
}