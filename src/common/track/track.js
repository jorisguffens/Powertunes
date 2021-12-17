import Typography from "@mui/material/Typography";

import style from "./track.module.scss";
import {useMemo} from "react";

export default function Track({data}) {
    const image = useMemo(() => {
        return data.album.images.sort((a, b) => a.height - b.height)[0];
    }, [data]);
    return (
        <div className={style.item}>
            <div className={style.albumCover}>
                <img src={image.url} alt={"Album cover of " + data.album.name}/>
            </div>
            <div className={style.info}>
                <Typography className={style.name}>
                    {data.name}
                </Typography>
                <Typography color={'secondary'}>
                    {data.artists.map((artist) => artist.name).join(", ")}
                </Typography>
            </div>
        </div>
    )
}