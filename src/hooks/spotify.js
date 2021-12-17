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

export default async function findReplacements(playlist, keywords, filter) {
    let trackItems = playlist.tracks.items;
    if (trackItems.length < playlist.tracks.total) {
        console.log("Not all tracks are loaded");
        trackItems = await fetchAllTracks(playlist);
    }

    if ( !Array.isArray(keywords) ) {
        keywords = [keywords];
    }

    const replacements = {};
    for (let i = 0; i < trackItems.length; i++) {
        const item = trackItems[i];
        const name = item.track.name;

        if ( !keywords.some(keyword => name.toLowerCase().includes(keyword)) ) {
            continue;
        }

        const artists = item.track.artists.map(artist => artist.uri);
        let query = name.split("-")[0].trim();
        query = query.replace(/ *\[[^\]]*]/, ''); // remove text between [] square brackets

        // keyword appears in name of song, ignore
        if ( keywords.some(keyword => query.toLowerCase().includes(keyword)) ) {
            continue;
        }

        const result = await spotify.searchTracks(query, {
            limit: 20
        });

        let items = result.tracks.items
            .filter(i =>
                i.uri !== item.track.uri &&
                !i.name.includes("-")
            );

        const nameLower = name.toLowerCase();
        if ( nameLower.includes("mix")
            || nameLower.includes("radio edit")
            || nameLower.includes("live") ) {
            // check if artists are included
            items = items.filter(i => i.artists.map(a => a.uri).some(a => artists.includes(a)));
        }

        if ( filter ) {
            items = items.filter(filter);
        }

        if (items.length === 0) {
            console.log("No replacement found for " + name);
            continue;
        }

        replacements[item.track.uri] = {
            replacement_uri: items[0].uri,
            remix_track: item.track
        };
    }
    return replacements;
}