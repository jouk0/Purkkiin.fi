const editly = require('editly');
const fs = require('fs')
const getMP3Duration = require('get-mp3-duration')
process.argv.forEach(async function (val, index, array) {
    if(val === "--songName") {
        var songName = array[(index+1)];
        var imagePath =  './file/' + songName + '/' + songName + '.png';
        var imagePath2 =  './file/' + songName + '/' + songName + '2.png';
        var imagePath3 = './file/' + songName + '/' + songName + '3.png';
        var mp3Path = './file/' + songName + '/' + songName + '.mp3';
        var mp4Path = './file/' + songName + '/' + songName + '.mp4';
        const buffer = fs.readFileSync(mp3Path)
        const duration = getMP3Duration(buffer)
        let mp3LenghtInSeconds = duration/1000
        let ensimmainenTeksti = 'Livenä 20.11.2021'
        let toinenTeksti = 'Mopo Baarissa kello 18.00 alkaen'
        let editSpec = {
            width: 1024,
            height: 768,
            outPath: mp4Path,
            fps: 25,
            clips: [
                { 
                    duration: 3, 
                    transition: 
                    { 
                        name: 'fade', 
                        duration: 1 
                    }, 
                    layers: [
                        { type: 'image', path: imagePath, zoomDirection: 'out', resizeMode: 'cover' },
                        { type: 'news-title', text: ensimmainenTeksti }
                    ]
                },
                { duration: 3, transition: { name: 'fade', duration: 1 }, layers: [{ type: 'image', path: imagePath2, zoomDirection: 'in', resizeMode: 'cover' },{ type: 'news-title', text: toinenTeksti }] },
                { duration: 3, transition: { name: 'fade', duration: 1 }, layers: [{ type: 'image', path: imagePath3, zoomDirection: 'out', resizeMode: 'cover' },{ type: 'news-title', text: ensimmainenTeksti }] },
                { duration: 3, transition: { name: 'fade', duration: 1 }, layers: [{ type: 'image', path: imagePath, zoomDirection: 'out', resizeMode: 'cover' },{ type: 'news-title', text: toinenTeksti }] },
                { duration: 3, transition: { name: 'fade', duration: 1 }, layers: [{ type: 'image', path: imagePath2, zoomDirection: 'in', resizeMode: 'cover' },{ type: 'news-title', text: ensimmainenTeksti }] },
                { duration: 3, transition: { name: 'fade', duration: 1 }, layers: [{ type: 'image', path: imagePath3, zoomDirection: 'out', resizeMode: 'cover' },{ type: 'news-title', text: toinenTeksti }] },
                { duration: 3, transition: { name: 'fade', duration: 1 }, layers: [{ type: 'image', path: imagePath, zoomDirection: 'out', resizeMode: 'cover' },{ type: 'news-title', text: ensimmainenTeksti }] },
                { duration: 3, transition: { name: 'fade', duration: 1 }, layers: [{ type: 'image', path: imagePath2, zoomDirection: 'in', resizeMode: 'cover' },{ type: 'news-title', text: toinenTeksti }] },
                { duration: 3, transition: { name: 'fade', duration: 1 }, layers: [{ type: 'image', path: imagePath3, zoomDirection: 'out', resizeMode: 'cover' },{ type: 'news-title', text: ensimmainenTeksti }] },
                { duration: 3, transition: { name: 'fade', duration: 1 }, layers: [{ type: 'image', path: imagePath, zoomDirection: 'out', resizeMode: 'cover' },{ type: 'news-title', text: toinenTeksti }] },
                { duration: 3, transition: { name: 'fade', duration: 1 }, layers: [{ type: 'image', path: imagePath2, zoomDirection: 'in', resizeMode: 'cover' },{ type: 'news-title', text: ensimmainenTeksti }] },
                { duration: 3, transition: { name: 'fade', duration: 1 }, layers: [{ type: 'image', path: imagePath3, zoomDirection: 'out', resizeMode: 'cover' },{ type: 'news-title', text: toinenTeksti }] },
                { duration: 3, transition: { name: 'fade', duration: 1 }, layers: [{ type: 'image', path: imagePath, zoomDirection: 'out', resizeMode: 'cover' },{ type: 'news-title', text: ensimmainenTeksti }] },
            ],
            audioNorm: { enable: true, gaussSize: 3, maxGain: 100 },
            audioTracks: [
                { path: mp3Path },
            ],
        }
        
        editSpec.clips.forEach((elem) => {
            elem.duration = mp3LenghtInSeconds / (editSpec.clips.length-1)
        })
        await editly(editSpec)
        .catch(console.error);
    }
})