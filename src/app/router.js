import {useEffect} from "react";
import {BrowserRouter, Route, Routes, useLocation} from "react-router-dom";

import Dashboard from "../routes/dashboard/dashboard";
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
        <BrowserRouter>
            <ScrollToTop/>
            <Routes>
                <Route path={"/*"} element={<Dashboard/>}/>
                <Route path={"/login"} element={<Login/>}/>
            </Routes>
        </BrowserRouter>
    )
}