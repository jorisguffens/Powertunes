import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import style from "./footer.module.scss";

export default function Footer() {
    return (
        <div className={style.footer}>
            <Container maxWidth="lg">
                <div className={style.socialMediaButtons}>
                    <a className="twitter-share-button"
                       href="https://twitter.com/intent/tweet"
                       data-size="large"
                       data-text="Using powertunes to update my spotify playlists. Try it out!"
                       data-url="https://powertunes.co"
                       data-hashtags="spotify,powertunes"
                    >
                        Tweet
                    </a>
                    &nbsp;

                    <div className="fb-like" data-href="https://powertunes.co"
                         data-width="200"
                         data-layout="button_count"
                         data-action="like" data-size="large" data-share="true"/>
                    &nbsp;

                    <a href="https://github.com/jorisguffens/powertunes"
                       target="_blank" rel="noreferrer noopener"
                       style={{fontSize: "28px", color: "#fff"}}
                    >
                        <i className="fab fa-github"/>
                    </a>
                </div>
                <br/>
                <Typography variant="body2" color="textSecondary" align="center">
                    Powertunes for Spotify&reg;, created by&nbsp;
                    <a href="https://jorisg.com" target="_blank"
                       rel="noreferrer noopener">
                        Joris Guffens
                    </a>
                </Typography>
            </Container>
        </div>
    )
}