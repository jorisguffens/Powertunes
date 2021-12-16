import {useEffect} from "react";
import {Route, Routes, useLocation} from "react-router-dom";

import Dashboard from "../routes/dashboard/dashboard";
import Callback from "../routes/login/callback";
import Login from "../routes/login/login";

function ScrollToTop() {
    const {pathname} = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

export default function Router() {

    return (
        <>
            <ScrollToTop/>
            <Routes>
                <Route path={"/*"} element={<Dashboard/>}/>

                <Route path={"/login"} element={<Login/>}/>
                <Route path={"/login/callback"} element={<Callback/>}/>
            </Routes>
        </>
    )
}