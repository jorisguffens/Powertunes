const shuffle = async (
    fetchAllTracks,
    removeTracksFromPlaylist,
    addTracksToPlaylist,
    onProgressChange,
    playlist,
) => {
    let items = await fetchAllTracks(playlist);

    onProgressChange(5);
    items = arrayShuffle(items);

    onProgressChange(10);
    for (let offset = 0; offset < items.length; offset += 100) {
        const length = Math.min(100, items.length - offset)
        const uris = items.slice(offset, offset + length).map(i => i.track.uri);
        await removeTracksFromPlaylist(playlist.id, uris);
        await addTracksToPlaylist(playlist.id, uris);
        onProgressChange(10 + (offset / playlist.tracks.total) * 90);
    }
}

function arrayShuffle(array) {
    let copy = [], n = array.length, i;

    // While there remain elements to shuffle…
    while (n) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * n--);

        // And move it to the new array.
        copy.push(array.splice(i, 1)[0]);
    }

    return copy;
}

export default shuffle;