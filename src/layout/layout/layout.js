import React from "react";

import Container from "@mui/material/Container";
import {AppBar, Toolbar} from "@mui/material";
import Typography from "@mui/material/Typography";

import {useUser} from "../../hooks/spotify";

import Footer from "../footer/footer";

import style from "./layout.module.scss";

function Layout({children}) {

    const {data: user} = useUser()

    return (
        <div className={style.root}>
            <AppBar>
                <Toolbar>
                    { user && (
                        <>
                            <Typography component="h1" variant="h5">
                                Spotify playlist tool
                            </Typography>
                            <div style={{flexGrow: '1'}}/>
                            <div>
                                Logged in as {user.display_name}
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