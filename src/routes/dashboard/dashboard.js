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

        auth.authService.startTimer();
    }, [auth]);

    useEffect(() => {
        if ( !error ) {
            return;
        }

        if ( auth.authService.isPending() ) {
            const id = setTimeout(() => {
                navigate("/login");
            }, 3000);
            return () => clearTimeout(id);
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