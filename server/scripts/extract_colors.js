const { getColorFromURL, getPaletteFromURL } = require('color-thief-node');

async function extractColors() {
    const imgUrl = 'file:///home/u0_a398/MusicApp/client/public/uploads/zawamlansarallah_profile.jpg';
    try {
        const dominantColor = await getColorFromURL(imgUrl);
        const palette = await getPaletteFromURL(imgUrl);
        console.log("Dominant Color RGB:", dominantColor);
        console.log("Palette RGB:");
        palette.forEach(p => console.log(p));
    } catch (e) {
        console.error(e);
    }
}
extractColors();
