let images = {
    init: function(imageArray, clips, categories) {
        
        imageArray.forEach((elem, ind) => {
            if(elem.categories.length) {
                categories = categories.concat(elem.categories)
            }
            let layers = [{ 
                type: 'image', 
                path: __dirname + '/data/videos/' + elem.path, 
                zoomDirection: 'in', 
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
                duration: 3, 
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

module.exports = images