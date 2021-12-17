import ClientOAuth2 from "client-oauth2";
import {useEffect, useState} from "react";
import {v4 as uuidv4} from 'uuid';
import crypto from 'crypto';
import {queryClient, useSpotify} from "./spotify";

const authClient = new ClientOAuth2({
    clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    accessTokenUri: 'https://accounts.spotify.com/api/token',
    authorizationUri: 'https://accounts.spotify.com/authorize',
    redirectUri: process.env.REACT_APP_APP_URI + '/login/callback',
    scopes: [
        'user-library-modify',
        'user-library-read',
        'playlist-modify-private',
        'playlist-modify-public',
        'playlist-read-private'
    ]
});

function applyToken(response) {
    const access_token = response.data.access_token;
    const refresh_token = response.data.refresh_token;

    sessionStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    return access_token;
}

export function useAuthClient() {
    return authClient;
}

export function useLoginCallback() {
    const [result, setResult] = useState(false);
    const spotify = useSpotify();

    useEffect(() => {
        authClient.code.getToken(window.location.href, {
            body: {
                code_verifier: localStorage.getItem("code_verifier")
            }
        }).then(res => {
            spotify.setAccessToken(applyToken(res));
            setResult(true);
        })
    }, [spotify]);

    return result;
}

export function useLogin() {
    return () => {
        const code_verifier = crypto.pseudoRandomBytes(32).toString("hex");
        const code_challenge = crypto
            .createHash("sha256")
            .update(code_verifier)
            .digest("base64")
            .replace("+", "-")
            .replace("/", "_")
            .replace("=", "");

        localStorage.setItem("code_verifier", code_verifier);
        window.location.href = authClient.code.getUri({
            state: uuidv4(),
            query: {
                code_challenge_method: 'S256',
                code_challenge: code_challenge
            }
        });
    };
}

export function useLogout() {
    const spotify = useSpotify();
    return () => {
        sessionStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        spotify.setAccessToken(null);
        queryClient.invalidateQueries("user");
    };
}

export function useRefresh() {
    const spotify = useSpotify();
    return () => {
        const refresh_token = localStorage.getItem("refresh_token");
        const token = authClient.createToken({
            refresh_token: refresh_token
        });
        return token.refresh({
            body: {
                client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID
            },
            headers: {
                'Authorization': ''
            }
        }).then((res) => {
            spotify.setAccessToken(applyToken(res));
        });
    }
}