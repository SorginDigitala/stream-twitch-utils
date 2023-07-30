
const synth=window.speechSynthesis
class TTS{
	static defaultVoice;	//voz por defecto (para leer nicks y demás)
	static defaultVoices;	//voces disponibles por defecto para los usuarios
	static lastVoiceUser;	//Último usuario en usar la voz
	static minPitch=0.7;
	static maxPitch=1.6;
	static minRate=0.7;
	static maxRate=1.6;
	static userVoices=JSON.parse(localStorage.getItem("user_voices"))??{};

	static start(){
		setTimeout(e=>{//a veces no se carga la lista de voces a tiempo.
			TTS.defaultVoice=synth.getVoices().find(e=>e.name.toLowerCase().includes(config.tts.defaultVoice))
			TTS.defaultVoices=synth.getVoices().filter(e=>e.name.toLowerCase().includes(config.tts.defaultVoices))
			//Groups.display_groups(tts_groups,tts_exceptions,config.tts);
		},10)
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

	static getVoice(user){
		if(!TTS.userVoices[user])
			TTS.setVoice(user,TTS.randVal(TTS.defaultVoices),TTS.getRandomPitch(),TTS.getRandomRate())
		const voice=TTS.userVoices[user]
		voice[0]=synth.getVoices().find(e=>e.voiceURI===voice[0])
		return voice;
	}

	static setVoice(username,voice,pitch,rate){
		TTS.userVoices[username]=[voice?voice.voiceURI:"",pitch,rate]
		localStorage.setItem("user_voices",JSON.stringify(TTS.userVoices))
	}

	static speak_msg(user,msg){
		if(TTS.lastVoiceUser!==user){
			TTS.lastVoiceUser=user
			TTS.speak(user,TTS.defaultVoice,1.2,1.2)
		}
		const mVoice=TTS.getVoice(user)
		TTS.speak(msg,mVoice[0],mVoice[1],mVoice[2])
	}

	static speak(msg,voice,pitch=1,rate=1){
		if(!synth.speaking)//no sé por qué pero el sintetizador chrasea en Edge y Chrome en algunos ordenadores. Estas lineas son para probar.
			synth.cancel()
		const utterThis	=new SpeechSynthesisUtterance(TTS.parse_urls(msg))
		utterThis.volume=config.volume*config.tts.volume
		utterThis.pitch	=pitch
		utterThis.rate	=rate
		utterThis.voice	=voice
		synth.speak(utterThis)
	}

	static parse_urls(msg){
		return config.tts.speech_urls==2?msg:msg.replace(/((?:(?:https?:\/\/)|(?:www\.))([-A-Z0-9\.]+)([-A-Z0-9+&\?@#\/%=~_\.|]+))/ig,config.tts.speech_urls==1?"$2":"")
	}

	static between(x,min,max){
		return x<min?min:(x>max?max:x)
	}

	static voiceCommand(platform,channel,user,color,msg){
		const x=msg.toLowerCase().split(" ").slice(1,4)
		if(!x[0]){
			//en vez devolver falso debería desactivar el tts para el usuario.
			return false;
		}
		const voice=TTS.getRandomVoice(synth.getVoices().filter(e=>e.name.toLowerCase().includes(x[0])))
		const pitch=x[1]?TTS.between(x[1],TTS.minPitch,TTS.maxPitch):1
		const rate=x[2]?TTS.between(x[2],TTS.minRate,TTS.maxRate):1
		
		TTS.setVoice(user,voice,pitch,rate)
		localStorage.setItem("user_voices",JSON.stringify(TTS.userVoices))
		return true;
	}
}