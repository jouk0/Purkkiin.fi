import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default class videosFunction {
    __dirname = __dirname
    constructor() {}
    init(videoArray, clips) {

        videoArray.forEach((elem, ind) => {
            let layers = [{ 
                type: 'video', 
                path: this.__dirname + '/data/videos/' + elem.path, 
                cutFrom: 0, 
                cutTo: elem.duration,
                resizeMode: 'cover'
            }]
            if(elem.text != '') {
                layers.push({ 
                    type: 'news-title', 
                    text: elem.text 
                })
            }
            if(elem.title != '') {
                layers.push({ 
                    type: 'title', 
                    position: 'top', 
                    text: elem.title 
                })
            }
            if(elem.subtitle != '') {
                layers.push({ 
                    type: 'subtitle',
                    text: elem.subtitle 
                })
            }
            clips[elem.index] = { 
                duration: elem.duration, 
                transition: { 
                    name: 'fade', 
                    duration: 1 
                }, 
                layers: layers
            }
        })
        return clips
    }
}
