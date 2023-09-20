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

	static async  getVoices(){
		return synth.getVoices().filter(e=>true);
	}

	static getVoice(user){
		if(!this.userVoices[user])
			this.setVoice(user,this.randVal(this.defaultVoices).voiceURI,this.getRandomPitch(),this.getRandomRate());
		return this.userVoices[user];
	}

	static getRandVoice(str){
		const voices=synth.getVoices().filter(e=>e.name.toLowerCase().includes(str.toLowerCase()));
		return this.randVal(voices);
	}

	static setVoice(username,voice,pitch=1,rate=1){
		this.userVoices[username]=[
			voice.toLowerCase(),
			this.between(pitch,this.minPitch,this.maxPitch),
			this.between(rate,this.minRate,this.maxRate)
		];
			console.log(this.userVoices[username])
		localStorage.setItem("user_voices",JSON.stringify(this.userVoices))
	}

	static speak_msg(user,msg,volume){
		if(this.lastVoiceUser!==user){
			this.lastVoiceUser=user;
			this.speak(user.replaceAll("_"," "),this.defaultVoice,volume,1.2,1.2)
		}
		const mVoice=this.getVoice(user)
		
		this.speak(
			msg,
			synth.getVoices().find(e=>e.lang.toLowerCase().includes(mVoice[0])  || e.name.toLowerCase().includes(mVoice[0])),
			//mVoice[0],
			volume,
			mVoice[1],
			mVoice[2]
		)
	}

	static speak(msg,voice,volume,pitch=1,rate=1){
		//if(!synth.speaking)synth.cancel()
			console.log("voz:",voice)
		const x		=new SpeechSynthesisUtterance(msg)
		x.volume	=volume
		x.pitch		=pitch
		x.rate		=rate
		x.voice		=voice
		synth.speak(x);
	}
}