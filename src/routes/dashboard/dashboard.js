import {useLogout, useRefresh} from "../../hooks/oauth2";
import {Route, Routes} from "react-router-dom";

import Layout from "../../layout/layout/layout";
import Playlists from "./playlists/playlists";

import {useUser} from "../../hooks/spotify";
import Playlist from "./playlist/playlist";
import {useEffect} from "react";
import {useNavigate} from "react-router";

export default function Dashboard() {

    const {isLoading, error, refetch} = useUser();
    const logout = useLogout();
    const refresh = useRefresh();
    const navigate = useNavigate();

    useEffect(() => {
        if (!error) {
            return;
        }

        refresh().then(() => {
            console.log("refetching");
            return refetch();
        }).catch(() => {
            logout();
            navigate("/login");
        })
    }, [error, refresh, logout, navigate, refetch]);

    if (isLoading || error) {
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