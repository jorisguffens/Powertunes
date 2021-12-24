import React from "react";

import Container from "@mui/material/Container";
import {AppBar, IconButton, Toolbar} from "@mui/material";
import Typography from "@mui/material/Typography";

import {useUser} from "../../util/spotify";

import Footer from "../footer/footer";

import style from "./layout.module.scss";
import {useAuth} from "react-oauth2-pkce";

function Layout({children}) {

    const {data: user} = useUser();
    const auth = useAuth();

    return (
        <div className={style.root}>
            <AppBar>
                <Toolbar>
                    { user && (
                        <>
                            <Typography component="h1" variant="h5">
                                Playlist Magic for Spotify
                            </Typography>
                            <div style={{flexGrow: '1'}}/>
                            <div>
                                {user.display_name}
                            </div>
                            <div>
                                <IconButton onClick={() => auth.authService.logout()} className={style.logoutButton}>
                                    <i className="fas fa-sign-out-alt"/>
                                </IconButton>
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