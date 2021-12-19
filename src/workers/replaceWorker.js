const replace = async (
    fetchAllTracks,
    searchTracks,
    playlist,
    keywords
) => {
    const trackItems = await fetchAllTracks(playlist);

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

        const result = await searchTracks(query, {
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

export default replace;