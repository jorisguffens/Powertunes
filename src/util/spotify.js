import SpotifyWebApi from "spotify-web-api-js";
import {useQuery} from "react-query";
import {useAuth} from "react-oauth2-pkce";
import {createContext, useCallback, useContext, useEffect, useState} from "react";

const SpotifyContext = createContext(new SpotifyWebApi());
export function SpotifyProvider({children}) {

    const auth = useAuth();

    // function to apply the auth service access token in the given spotify api
    const applyAccessToken = useCallback((spotify) => {
        const at = auth.authService.getAuthTokens().access_token;
        if (at) spotify.setAccessToken(at);
        return spotify;
    }, [auth]);

    // create spotify web client with initial access token
    const [spotify] = useState(() => applyAccessToken(new SpotifyWebApi()));

    // update access token in spotify when the one in the auth service changes
    useEffect(() => applyAccessToken(spotify), [auth, spotify, applyAccessToken]);

    return (
        <SpotifyContext.Provider value={spotify}>
            {children}
        </SpotifyContext.Provider>
    )
}

export function useSpotify() {
    return useContext(SpotifyContext);
}

export function useUser() {
    const spotify = useSpotify();
    return useQuery(["me", spotify.getAccessToken], () => spotify.getMe());
}

export function usePlaylists() {
    const spotify = useSpotify();
    const {data: user} = useUser();
    return useQuery("playlists", () => spotify.getUserPlaylists(user.id));
}

export function usePlaylist(id) {
    const spotify = useSpotify();
    return useQuery("playlist-" + id, () => spotify.getPlaylist(id));
}

export function useFetchTracks(playlist) {
    const spotify = useSpotify();
    return () => fetchAllTracks(spotify, playlist);
}

export function fetchAllTracks(spotify, playlist) {
    const trackItems = playlist.tracks.items;
    if ( trackItems && trackItems.length >= playlist.tracks.total) {
        return Promise.resolve(trackItems);
    }

    const tracks = new Array(playlist.tracks.total);
    let index = 0;
    if ( trackItems ) {
        for (; index < trackItems.length; index++) {
            tracks[index] = trackItems[index];
        }
    }

    const promises = [];
    for (; index < playlist.tracks.total; index += 100) {
        const offset = index;
        const limit = 100;
        promises.push(spotify.getPlaylistTracks(playlist.id, {offset, limit}).then((result) => {
            for (let i = 0; i < result.items.length; i++) {
                tracks[i + offset] = result.items[i];
            }
        }));
    }

    return Promise.all(promises).then(() => {
        playlist.tracks.items = tracks;
        return tracks;
    });
}