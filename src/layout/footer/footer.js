import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import style from "./footer.module.scss";

export default function Footer() {
    return (
        <div className={style.footer}>
            <Container maxWidth="lg">
                <Typography variant="body2" color="textSecondary" align="center">
                    Powertunes for Spotify, created by&nbsp;
                    <a href="https://jorisg.com" target="_blank"
                       rel="noreferrer noopener">
                    Joris Guffens
                </a>
                </Typography>
            </Container>
        </div>
    )
}