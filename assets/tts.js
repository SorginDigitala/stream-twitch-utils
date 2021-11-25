var synth = window.speechSynthesis;

var inputForm = document.querySelector('form');
var inputTxt = document.querySelector('input');
var voiceSelect = document.querySelector('select');

function populateVoiceList() {
  voices = synth.getVoices()//.filter(voice=>voice.lang.includes("es"));
  console.log(voices)

  for(i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

inputForm.onsubmit = function(event) {
  event.preventDefault();

  var utterThis = new SpeechSynthesisUtterance(inputTxt.value);
  utterThis.volume = 1
  utterThis.pitch = 0.5
  utterThis.rate = 1
  var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  for(i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      utterThis.voice = voices[i];
    }
  }
  synth.speak(utterThis);
  inputTxt.blur();
}

const speakRandom = ( msg )=>{
  voices = synth.getVoices()
  console.log(voices)
  var utterThis = new SpeechSynthesisUtterance(msg);
  utterThis.volume = 1
  utterThis.pitch = 0.5+1.5*Math.random()
  utterThis.rate = 0.5+0.5*Math.random()
  utterThis.voice = voices[Math.floor(Math.random() * voices.length)];
  synth.speak(utterThis);
}

