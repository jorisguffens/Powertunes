import React from "react";
import {useAuth} from "react-oauth2-pkce";
import Container from "@mui/material/Container";
import {AppBar, Button, IconButton, Toolbar, useMediaQuery, useTheme} from "@mui/material";
import Typography from "@mui/material/Typography";

import {useUser} from "../../util/spotify";

import Footer from "../footer/footer";

import SpotifyLogo from "../../assets/spotify-logo.png";
import style from "./layout.module.scss";

function Layout({children}) {

    const {data: user} = useUser();
    const auth = useAuth();

    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <div className={style.root}>
            <AppBar>
                <Toolbar>
                    {user && (
                        <>
                            <Typography component="h1" variant="h5" className={style.title}>
                                Powertunes
                                {!mobile && (
                                    <>
                                        &nbsp;for
                                        <a href="https://spotify.com" target="_blank" rel="noreferrer noopener">
                                            <img src={SpotifyLogo} alt="Spotify"/>
                                        </a>
                                    </>
                                )}
                            </Typography>
                            <div style={{flexGrow: '1'}}/>
                            <div>
                                {mobile ? (
                                    <IconButton color="primary" onClick={() => auth.authService.logout()}
                                                className={style.logoutBtnMobile}>
                                        <i className="fas fa-sign-out-alt"/>
                                    </IconButton>
                                ) : (
                                    <Button variant="contained" color="primary"
                                            onClick={() => auth.authService.logout()}>
                                        <i className="fas fa-sign-out-alt"/>&nbsp; Logout
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </Toolbar>
            </AppBar>
            <Toolbar/>
            <br/>
            <main>
                <Container maxWidth={"md"}>
                    {children}
                </Container>
            </main>
            <footer>
                <Footer/>
            </footer>
        </div>
    );
}

export default Layout;