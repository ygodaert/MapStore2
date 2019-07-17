const { getStyle } = require('../../components/map/openlayers/VectorStyle');

const SLDParser = require('./SldStyleParser').default;
const OpenLayersParser = require('./OpenLayersStyleParser').default;

const sldParser = new SLDParser();
const olParser = new OpenLayersParser();

module.exports = {
    mapstore: ({ styleBody }, options, olLayer) => {
        if (olLayer) olLayer.setStyle(getStyle(options));
    },
    sld: ({ styleBody }, options, olLayer) => {
        if (!styleBody) return null;
        sldParser.readStyle(styleBody)
            .then(parsedStyle =>
                olParser
                    .writeStyle(parsedStyle)
                    .then(olStyle => olLayer.setStyle(options.styleWrapper ? options.styleWrapper(olStyle) : olStyle))
                    .catch(error => console.log(error))
            )
            .catch(error => console.log(error));
    }
};
