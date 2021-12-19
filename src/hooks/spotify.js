import SpotifyWebApi from "spotify-web-api-js";
import {useQuery} from "react-query";

const spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken(sessionStorage.getItem("access_token"));

export function useSpotify() {
    return spotifyApi;
}

export function useUser() {
    const spotify = useSpotify();
    return useQuery("me", () => spotify.getMe());
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
        promises.push(spotifyApi.getPlaylistTracks(playlist.id, {offset, limit}).then((result) => {
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