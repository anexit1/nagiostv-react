// so this new Audio() function dumps a stacktrace when it cant find the audio file to play
// we should add some extra test that the file exists, if possible
/*
 * Chrome autoplay policy
 * https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
 */
import _ from 'lodash';

export const playSoundEffectDebounced = _.debounce(function(type, state, settings) {
  playSoundEffect(type, state, settings);
}, 200);

function pickSound(soundConfig) {
  // if sound is delimited by a semicolon; then choose one at random
  if (soundConfig.indexOf(';') !== -1) {
    const soundArray = soundConfig.split(';');
    return soundArray[Math.floor(Math.random() * soundArray.length)];
  }
  return soundConfig;
}

export function playSoundEffect(type, state, settings) {
  
  const audioCritical = pickSound(settings.soundEffectCritical);
  const audioWarning = pickSound(settings.soundEffectWarning);
  const audioOk = pickSound(settings.soundEffectOk);

  //console.log('playSoundEffect', type, state, audioCritical, audioWarning, audioOk);

  let audio;

  switch(type+state) {
    case 'hostdown':
    case 'hostunreachable':
      audio = new Audio(audioCritical);
      break;
    case 'hostup':
      audio = new Audio(audioOk);
      break;
    case 'servicecritical':
      audio = new Audio(audioCritical);
      break;
    case 'servicewarning':
      audio = new Audio(audioWarning);
      break;
    case 'serviceok':
      audio = new Audio(audioOk);
      break;
    default:
      break;
  }

  if (audio) {
    const promise = audio.play();
    promise.catch((err) => {
      if (err instanceof DOMException) {
        console.log(err.message);
        //console.log(err.code);
        //console.log(err.name);
        console.log('Blocked by Chrome autoplay prevention. Touch the UI to enable sound');
      } else {
        console.log('error');
        console.log(err);
        console.log(typeof err);
      }
    });
  }
}

export function speakAudio(words) {
  
  //console.log('speakAudio', words);

  const msg = new SpeechSynthesisUtterance(words);
  window.speechSynthesis.speak(msg);
  
}
