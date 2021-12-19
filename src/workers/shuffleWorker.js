const shuffle = async (
    fetchAllTracks,
    removeTracksFromPlaylist,
    addTracksToPlaylist,
    onProgressChange,
    playlist,
) => {
    let items = await fetchAllTracks(playlist);

    onProgressChange(5);
    arrayShuffle(items);

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
    let m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);

        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

export default shuffle;