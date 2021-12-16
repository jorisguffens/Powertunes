import {useParams} from "react-router-dom";
import {usePlaylist, useSpotify} from "../../../hooks/spotify";
import {Card, CardContent, Divider, IconButton, Skeleton} from "@mui/material";
import Typography from "@mui/material/Typography";

import style from "./playlist.module.scss";
import Button from "@mui/material/Button";
import {useQueryClient} from "react-query";
import {useCallback, useEffect, useState} from "react";
import clsx from "clsx";
import MagicTool from "../magic/magicTool";
import {useNavigate} from "react-router";

export default function Playlist() {

    const {id} = useParams();
    const {data: playlist} = usePlaylist(id);
    const [magicTool, setMagicTool] = useState(false);
    const navigate = useNavigate();

    if (!playlist) {
        return (
            <>
                <Skeleton variant={"rectangular"} height={72}/>
                <br/><br/><br/>
                <Skeleton variant={"rectangular"} height={40}/><br/>
                <Skeleton variant={"rectangular"} height={40}/><br/>
                <Skeleton variant={"rectangular"} height={40}/>
            </>
        )
    }

    return (
        <>
            <div className={style.header}>
                <div className={style.headerActions}>
                    <IconButton onClick={() => navigate('/')}>
                        <i className="fas fa-arrow-left"/>
                    </IconButton>
                </div>
                <Typography variant={"h2"}>{playlist.name}</Typography>
            </div>
            <br/>
            <div>
                <Button onClick={() => setMagicTool(true)}>
                    Magic Tool
                </Button>
            </div>
            <Divider/>
            <br/>
            {playlist.tracks.items.map(item =>
                <Track key={item.track.id} playlistId={id} data={item.track}/>)
            }

            {magicTool && <MagicTool playlist={playlist} handleClose={() => setMagicTool(false)}/>}
        </>
    )
}

function Track({playlistId, data}) {

    const [busy, setBusy] = useState(false);

    const spotify = useSpotify();
    const queryClient = useQueryClient();

    const remove = useCallback((e) => {
        e.preventDefault();
        setBusy(true);

        spotify.removeTracksFromPlaylist(playlistId, [data.uri]).then(() => {
            queryClient.setQueryData("playlist-" + playlistId, (old) => {
                const items = old.tracks.items;
                const item = items.filter(i => i.track.uri === data.uri)[0];
                const index = items.indexOf(item);
                items.splice(index, 1);
                return {...old};
            });
        }).catch((err) => {
            // TODO show error
            setBusy(false);
        })
    }, [playlistId, data]);

    const image = data.album.images.sort((a, b) => a.height - b.height)[0];
    return (
        <>
            <Card className={style.item}>
                <CardContent className={style.itemContent}>
                    <div className={style.itemAlbumCover}>
                        <img src={image.url} alt={"Album cover of " + data.album.name}/>
                    </div>
                    <div className={style.itemTrackInfo}>
                        <Typography>
                            {data.name}
                        </Typography>
                        <Typography color={'secondary'}>
                            {data.artists.map((artist) => artist.name).join(", ")}
                        </Typography>
                    </div>
                    <div className={clsx(style.itemActions, busy && style.itemActionsBusy)}>
                        <IconButton onClick={remove}>
                            <i className="fas fa-trash"/>
                        </IconButton>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}