const { Deepgram } = require('@deepgram/sdk');
const fs = require('fs');
const common = require('../../common')
let sanoitukset = async () => {

  // The API key you created in step 1
  const deepgramApiKey = '114acd028fb081f5c7892173e4c691f68ad94158';

  // Replace with your file path and audio mimetype
  const pathToFile = __dirname + '/songs/Iwouldliketo.flac';
  const mimetype = 'audio/flac';

  // Initializes the Deepgram SDK
  const deepgram = new Deepgram(deepgramApiKey);

  console.log('Requesting transcript...')
  console.log('Your file may take up to a couple minutes to process.')
  console.log('While you wait, did you know that Deepgram accepts over 40 audio file formats? Even MP4s.')
  console.log('To learn more about customizing your transcripts check out developers.deepgram.com.')

  let response = await deepgram.transcription.preRecorded({ 
      buffer: fs.readFileSync(pathToFile), mimetype 
    },{ 
      punctuate: false, 
      language: 'en-GB',
      //language: 'fi-FI',
      utterances: true
  })
  let id = common.makeid(5)
  console.log(id)
  await fs.writeFileSync(__dirname + '/responses/'+ id + '-response.json', JSON.stringify(response))
  const srtTranscript = response.toSRT()
  await fs.writeFileSync(__dirname + '/responses/'+ id + '-transcript.json', JSON.stringify(srtTranscript))
}
sanoitukset()