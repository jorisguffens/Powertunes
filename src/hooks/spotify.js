import SpotifyWebApi from "spotify-web-api-js";
import {QueryClient, useQuery} from "react-query";

const qc = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false
        }
    }
});
export const queryClient = qc;

const spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken(localStorage.getItem("access_token"));

export const spotify = spotifyApi;

export function useSpotify() {
    return spotifyApi;
}

export function useUser() {
    const spotify = useSpotify();
    return useQuery("user", () => spotify.getMe());
}

export function usePlaylists() {
    const spotify = useSpotify();
    const {data: user} = qc.getQueryData("user");
    return useQuery("playlists", () => spotify.getUserPlaylists(user));
}

export function usePlaylist(id) {
    const spotify = useSpotify();
    return useQuery("playlist-" + id, () => spotify.getPlaylist(id));
}

export function fetchAllTracks(playlist) {
    const trackItems = playlist.tracks.items;
    if (trackItems.length >= playlist.tracks.total) {
        return Promise.resolve(trackItems);
    }

    const tracks = new Array(playlist.tracks.total);
    for (let i = 0; i < trackItems.length; i++) {
        tracks[i] = trackItems[i];
    }

    const promises = [];
    for (let i = trackItems.length; i < playlist.tracks.total; i += 100) {
        const offset = i;
        const limit = 100;
        promises.push(spotify.getPlaylistTracks(playlist.id, {offset, limit}).then((result) => {
            for (let i = 0; i < result.items.length; i++) {
                tracks[i + offset] = result.items[i];
            }
        }));
    }

    return Promise.all(promises).then(() => {
        playlist.tracks.items = tracks;
        queryClient.setQueryData("playlist-" + playlist.id, {...playlist});
        return tracks;
    });
}