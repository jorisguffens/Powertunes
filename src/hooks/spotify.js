import SpotifyWebApi from "spotify-web-api-js";
import {QueryClient, useQuery} from "react-query";

const qc = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false
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
    const { data: user } = qc.getQueryData("user");
    return useQuery("playlists", () => spotify.getUserPlaylists(user));
}

export function usePlaylist(id) {
    const spotify = useSpotify();
    return useQuery("playlist-" + id, () => spotify.getPlaylist(id));
}