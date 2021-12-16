import {Navigate} from "react-router";

import {useLoginCallback} from "../../hooks/oauth2";

export default function LoginCallback() {
    const result = useLoginCallback();

    if (result) {
        return <Navigate to={"/"}/>
    }

    return null;
}