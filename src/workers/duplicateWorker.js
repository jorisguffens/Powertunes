const duplicate = async (
    fetchAllTracks,
    playlist,
) => {
    const trackItems = await fetchAllTracks(playlist);

    const duplicates = {};
    for (let i = 0; i < trackItems.length; i++) {
        const track = trackItems[i].track;
        if (duplicates[track.uri]) {
            duplicates[track.uri].count++;
            continue;
        }

        // look for the same song but in a different album, so name & artists must match
        const artists = JSON.stringify(track.artists.map(a => a.uri));
        for (let dup of Object.values(duplicates)) {
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

export default duplicate;