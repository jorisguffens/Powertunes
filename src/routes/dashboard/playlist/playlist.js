import {useParams} from "react-router-dom";
import {queryClient, spotify, usePlaylist, useSpotify} from "../../../hooks/spotify";
import {Card, CardContent, Divider, IconButton, Skeleton} from "@mui/material";
import Typography from "@mui/material/Typography";

import style from "./playlist.module.scss";
import Button from "@mui/material/Button";
import {useQueryClient} from "react-query";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import clsx from "clsx";
import {useNavigate} from "react-router";
import ReplaceTool from "../../../tools/replaceTool/replaceTool";
import Track from "../../../common/track/track";
import useBottomReached from "../../../hooks/useBottomReached";
import DuplicateTool from "../../../tools/duplicateTool/duplicateTool";
import ShuffleTool from "../../../tools/shuffleTool/shuffleTool";

export default function Playlist() {

    const {id} = useParams();
    const {data: playlist} = usePlaylist(id);
    const navigate = useNavigate();

    // tools
    const [replaceTool, setReplaceTool] = useState(false);
    const [duplicateTool, setDuplicateTool] = useState(false);
    const [shuffleTool, setShuffleTool] = useState(false);

    // infinite scroll
    const containerRef = useRef();
    const isBottomReached = useBottomReached(containerRef);
    const [isLoadingMore, setLoadingMore] = useState(false);

    const unloadedTrackCount = useMemo(() => {
        if ( !playlist ) return ;
        return playlist.tracks.total - playlist.tracks.items.length;
    }, [playlist]);

    useEffect(() => {
        if ( !playlist || !isBottomReached || isLoadingMore ) {
            return;
        }
        if ( unloadedTrackCount <= 0 ) {
            return;
        }

        setLoadingMore(true);

        const tracks = playlist.tracks.items;
        spotify.getPlaylistTracks(playlist.id, {
            offset: tracks.length,
            limit: 100
        }).then((result) => {
            result.items.forEach(item => tracks.push(item));
            playlist.tracks.items = tracks;
            queryClient.setQueryData("playlist-" + playlist.id, {...playlist, count: playlist.tracks.items.length});
        }).finally(() => {
            setLoadingMore(false);
        });

        // don't include isLoadingMore, it will trigger another load because the dom has not updated yet so bottom is still reached
    }, [unloadedTrackCount, isBottomReached, playlist]);

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

    let fill = [];
    if ( unloadedTrackCount > 0 ) {
        for ( let i = 0; i < unloadedTrackCount; i++ ) {
            fill.push(
                <Skeleton key={i} height={53} variant={"rectangular"}
                          style={{marginBottom: "5px", borderRadius: "5px"}}/>
            )
        }
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
            <div className={style.toolButtons}>
                <Button onClick={() => setReplaceTool(true)}>
                    Replace Tool
                </Button>
                <Button onClick={() => setDuplicateTool(true)}>
                    Duplicate Tool
                </Button>
                <Button onClick={() => setShuffleTool(true)}>
                    Shuffle Tool
                </Button>
            </div>
            <Divider/>
            <br/>

            <div ref={containerRef}>
                {playlist.tracks.items.map((item, i) =>
                    <PlaylistTrack key={item.track.id + "" + i} playlistId={id} data={item.track}/>)
                }
            </div>

            {fill}

            {replaceTool && <ReplaceTool playlist={playlist} handleClose={() => setReplaceTool(false)}/>}
            {duplicateTool && <DuplicateTool playlist={playlist} handleClose={() => setDuplicateTool(false)}/>}
            {shuffleTool && <ShuffleTool playlist={playlist} handleClose={() => setShuffleTool(false)}/>}
        </>
    )
}

function PlaylistTrack({playlistId, data}) {

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
    }, [playlistId, data, queryClient, spotify]);

    return (
        <>
            <Card className={style.item}>
                <CardContent className={style.itemContent}>
                    <Track data={data}/>
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