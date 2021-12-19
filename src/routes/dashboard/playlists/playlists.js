import {usePlaylists, useUser} from "../../../hooks/spotify";
import Typography from "@mui/material/Typography";
import {Card, CardContent, Skeleton} from "@mui/material";

import style from "./playlists.module.scss";
import {Link} from "react-router-dom";

export default function Playlists() {

    const {data: playlists} = usePlaylists();
    const {data: user} = useUser();

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
            {view}
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
                    {image && <img src={image.url} alt=""/>}
                    <div style={{marginLeft: "20px"}}>
                        <Typography variant={"h5"} component={"h3"}>
                            {data.name}
                        </Typography>
                        <Typography style={{color: "#bbb"}}>
                            {data.description}
                        </Typography>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}