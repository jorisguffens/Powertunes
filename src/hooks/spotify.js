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

export async function findReplacements(playlist, keywords, filter) {
    let trackItems = playlist.tracks.items;
    if (trackItems.length < playlist.tracks.total) {
        console.log("Not all tracks are loaded");
        trackItems = await fetchAllTracks(playlist);
    }

    if (!Array.isArray(keywords)) {
        keywords = [keywords];
    }

    const replacements = {};
    for (let i = 0; i < trackItems.length; i++) {
        const item = trackItems[i];
        const name = item.track.name;

        if (!keywords.some(keyword => name.toLowerCase().includes(keyword))) {
            continue;
        }

        const artists = item.track.artists.map(artist => artist.uri);
        let query = name.split("-")[0].trim();
        query = query.replace(/ *\[[^\]]*]/, ''); // remove text between [] square brackets

        // keyword appears in name of song, ignore
        if (keywords.some(keyword => query.toLowerCase().includes(keyword))) {
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
        if (nameLower.includes("mix")
            || nameLower.includes("radio edit")
            || nameLower.includes("live")) {
            // check if artists are included
            items = items.filter(i => i.artists.map(a => a.uri).some(a => artists.includes(a)));
        }

        if (filter) {
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

export async function findDuplicates(playlist) {
    let trackItems = playlist.tracks.items;
    if (trackItems.length < playlist.tracks.total) {
        console.log("Not all tracks are loaded");
        trackItems = await fetchAllTracks(playlist);
    }

    const duplicates = {};
    for (let i = 0; i < trackItems.length; i++) {
        const track = trackItems[i].track;
        if (duplicates[track.uri]) {
            duplicates[track.uri].count++;
            continue;
        }

        // look for the same song but in a different album, so name & artists must match
        const artists = JSON.stringify(track.artists.map(a => a.uri));
        for ( let dup of Object.values(duplicates) ) {
            if (dup.track.name === track.name &&
                JSON.stringify(dup.track.artists.map(a => a.uri)) === artists) {
                const item = duplicates[dup.track.uri];
                item.count++;
                item.remove = [...item.remove, track.uri];
                break;
            }
        }

        duplicates[track.uri] = {
            count: 1,
            track: track,
            remove: [track.uri]
        }
    }

    for (let uri of Object.keys(duplicates)) {
        if (duplicates[uri].count <= 1) {
            delete duplicates[uri];
        }
    }

    return duplicates;
}

function cryptoRandomShuffle(array) {
    const rndbytes = new Uint8Array(100);
    let j, r=100, tmp, mask=0x3f;

    for ( let i = array.length - 1; i > 0; i--) {
        if ( (i & (i+1)) === 0 ) mask >>= 1;
        do {
            if (r === 100) {
                crypto.getRandomValues(rndbytes);
                r = 0;
            }
            j = rndbytes[r++] & mask;
        } while (j > i);

        tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
}

export async function cryptoShuffle(playlist) {
    let trackItems = playlist.tracks.items;
    if (trackItems.length < playlist.tracks.total) {
        console.log("Not all tracks are loaded");
        trackItems = await fetchAllTracks(playlist);
    }

    cryptoRandomShuffle(trackItems);

    for ( let offset = 0; offset < trackItems.length; offset+=100 ) {
        const length = Math.min(100, trackItems.length - offset)
        const uris = trackItems.slice(offset, offset + length).map(i => i.track.uri);
        await spotify.removeTracksFromPlaylist(playlist.id, uris);
        await spotify.addTracksToPlaylist(playlist.id, uris);
    }
}