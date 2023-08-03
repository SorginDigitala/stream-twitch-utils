const synth=window.speechSynthesis;
class TTS{
	static defaultVoice;	//voz por defecto (para leer nicks y demás)
	static defaultVoices;	//voces disponibles por defecto para los usuarios
	static lastVoiceUser;	//Último usuario en usar la voz
	static minPitch=0.7;
	static maxPitch=1.6;
	static minRate=0.7;
	static maxRate=1.6;
	static userVoices=JSON.parse(localStorage.getItem("user_voices"))??{};

	static loadVoices(defaultVoice,defaultVoices){
		setTimeout(e=>{//a veces no se carga la lista de voces a tiempo.
			TTS.defaultVoice=synth.getVoices().find(e=>e.name.toLowerCase().includes(defaultVoice))
			TTS.defaultVoices=synth.getVoices().filter(e=>e.name.toLowerCase().includes(defaultVoices))
			//Groups.display_groups(tts_groups,tts_exceptions,config.tts);
		},100);
	}

	static randVal(arr){
		return arr[Math.floor(Math.random()*arr.length)]
	}
	static rand(min,max){
		return Math.random()*(max-min)+min;
	}
	static getRandomPitch(){
		return this.rand(this.minPitch,this.maxPitch);
	}
	static getRandomRate(){
		return this.rand(this.minRate,this.maxRate);
	}
	static between(x,min,max){
		return x<min?min:(x>max?max:x)
	}

	static getVoice(user){
		if(!TTS.userVoices[user]){
			TTS.setVoice(user,TTS.randVal(TTS.defaultVoices),TTS.getRandomPitch(),TTS.getRandomRate())
		}
		const voice=TTS.userVoices[user]
		voice[0]=synth.getVoices().find(e=>e.voiceURI===voice[0])
		return voice;
	}

	static getRandVoice(str){
		const voices=synth.getVoices().filter(e=>e.name.toLowerCase().includes(str.toLowerCase()));
		return this.randVal(voices);
	}

	static setVoice(username,voice,pitch=1,rate=1){
		TTS.userVoices[username]=[voice?voice.voiceURI:"",pitch,rate]
		localStorage.setItem("user_voices",JSON.stringify(TTS.userVoices))
	}

	static speak_msg(user,msg,volume){
		if(TTS.lastVoiceUser!==user){
			TTS.lastVoiceUser=user;
			TTS.speak(user,TTS.defaultVoice,volume,1.2,1.2)
		}
		const mVoice=TTS.getVoice(user)
		TTS.speak(msg,mVoice[0],volume,mVoice[1],mVoice[2])
	}

	static speak(msg,voice,volume,pitch=1,rate=1){
		//if(!synth.speaking)synth.cancel()
		const x		=new SpeechSynthesisUtterance(msg)
		x.volume	=volume
		x.pitch		=pitch
		x.rate		=rate
		x.voice		=voice
		synth.speak(x);
	}
}