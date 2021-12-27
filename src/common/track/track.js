import React, {useMemo} from "react";
import Typography from "@mui/material/Typography";

import style from "./track.module.scss";

export default function Track({data}) {
    const image = useMemo(() => {
        return data.album.images.sort((a, b) => a.height - b.height)[0];
    }, [data]);

    return (
        <div className={style.item} title={data.name}>
            <div className={style.albumCover}>
                <a href={data.album.external_urls.spotify} target="_blank" rel="noreferrer noopener">
                    <img src={image.url} alt={"Album cover of " + data.album.name}/>
                </a>
            </div>
            <div className={style.info}>
                <Typography className={style.name}>
                    <a href={data.external_urls.spotify} target="_blank" rel="noreferrer noopener"
                       className={style.link}>
                        {data.name}
                    </a>
                </Typography>
                <Typography className={style.artist}>
                    {data.artists.map((artist, i) => {
                        const prefix = i > 0 ? ", " : "";
                        return (
                            <React.Fragment key={i}>
                                {prefix}
                                <a href={artist.external_urls.spotify} target="_blank" rel="noreferrer noopener"
                                   className={style.link}>
                                    {artist.name}
                                </a>
                            </React.Fragment>
                        )
                    })}
                </Typography>
            </div>
        </div>
    )
}