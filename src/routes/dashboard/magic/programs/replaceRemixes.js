import {queryClient, spotify} from "../../../../hooks/spotify";

export default async function replaceRemixes(playlist) {
    console.log("replacing remixes");

    const trackItems = playlist.tracks.items;
    if ( trackItems.length < playlist.tracks.total ) {
        console.log("Not all tracks are loaded");
        return;
    }

    const remove = [];
    const add = [];

    for ( let i = 0; i < trackItems.length; i++ ) {
        const item = trackItems[i];

        const name = item.track.name;
        if ( !name.toLowerCase().includes("remix") ) {
            continue;
        }

        const artists = item.track.artists.map(artist => artist.name)
            .filter(artist => !name.includes(artist));
        const query = name.toLowerCase().split("-")[0].trim() + " " + artists.join(", ");
        console.log(query);
        const result = await spotify.searchTracks(query, {
            limit: 10
        });

        const items = result.tracks.items.filter(i => i.uri !== item.uri);
        if ( items.length === 0 ) {
            console.log("No replacement found for " + name);
            continue;
        }

        remove.push(item.track.uri);

        const replacement = items[0];
        add.push(replacement.uri);
    }

    console.log("remove", remove);
    console.log("add", add)
    if ( remove.length === 0 ) {
        return;
    }

    console.log(playlist.id);
    await spotify.removeTracksFromPlaylistWithSnapshotId(playlist.id, remove, playlist.snapshot_id);
    await spotify.addTracksToPlaylist(playlist.id, add);
}