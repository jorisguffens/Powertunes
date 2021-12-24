import {Route, Routes} from "react-router-dom";

import Layout from "../../layout/layout/layout";
import Playlists from "./playlists/playlists";

import {useUser} from "../../util/spotify";
import Playlist from "./playlist/playlist";
import {useNavigate} from "react-router";
import {useEffect} from "react";
import {useAuth} from "react-oauth2-pkce";

export default function Dashboard() {

    const auth = useAuth();
    const { isLoading, error } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if ( auth.authService.isPending() || !auth.authService.isAuthenticated() ) {
            return;
        }

        // refresh token after 50 minutes
        auth.authService.armRefreshTimer(auth.authService.getAuthTokens().refresh_token, 1000 * 60 * 50);
    }, [auth]);

    useEffect(() => {
        if ( !error || auth.authService.isPending() ) {
            return;
        }

        navigate("/login");
    }, [error, auth, navigate]);

    if ( isLoading || error ) {
        return null;
    }

    return (
        <Layout>
            <Routes>
                <Route path={"/"} element={<Playlists/>}/>
                <Route path={"/playlist/:id"} element={<Playlist/>}/>
            </Routes>
        </Layout>
    )
}