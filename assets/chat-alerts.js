
class Alerts{
	static start(){
		// Fuerza el audio para mostrar el mensaje de interacción.
		audio_alert=new Audio();
		audio_alert.volume=.001;
		Alerts.play();

		sound_alert.value=config.alerts.sound_alert;
		custom_sound.value=config.alerts.custom_sound;
		sound_alert.onchange=e=>{
			custom_sound.classList.toggle("hide",sound_alert.value!=="custom");
			config.alerts.sound_alert=sound_alert.value;
			audio_alert=new Audio(config.alerts.sound_alert==="custom"?config.alerts.custom_sound:"./assets/audios/alerts/"+config.alerts.sound_alert+".mp3");
			audio_alert.volume=config.volume;
			if(e){
				Alerts.play();
				Config.save();
			}
		}
		alert_test.onclick=e=>Alerts.play();
		sound_alert.onchange();
		custom_sound.onchange=e=>{config.alerts.custom_sound=custom_sound.value;Config.save();};
		Groups.display_groups(alerts_groups,alerts_exceptions,config.alerts);
	}

	static enable(b){
		if(b)
			Events.add("PRIVMSG",Alerts.play);
		else
			Events.remove("PRIVMSG",Alerts.play);
		alerts.classList.toggle("hide",!b);
	}

	static play(p){
		if(p && (p.params["emote-only"] || !xor_msg(p.params,config.alerts)))
			return;
		audio_alert.play().then().catch(e=>{
			if(e.name==="NotAllowedError")
				permissions_notice.classList.toggle("hide",false);
			else
				console.error("error",e.name);
		});
	}

	static set_volume(){
		audio_alert.volume=config.volume;
	}
}

class TTS{
	static lastVoiceUser;
	static defaultVoice;
	static userVoices=JSON.parse(localStorage.getItem("user_voices"))??{};

	static start(){
		setTimeout(e=>{//a veces no se carga la lista de voces a tiempo.
			TTS.defaultVoice=synth.getVoices().find(e=>e.lang=="es-MX");
			//TTS.defaultVoice=synth.getVoices().find(e=>e.default)??synth.getVoices()[0];
			Groups.display_groups(tts_groups,tts_exceptions,config.tts);
			Events.add("COMMAND",TTS.onCommand);
		},10);
	}

	static enable(b){
		if(b)
			Events.add("PRIVMSG",TTS.play);
		else
			Events.remove("PRIVMSG",TTS.play);
		tts.classList.toggle("hide",!b);
	}

	static onCommand(d){
		if(!d.msg.startsWith("!voice "))
			return;
		var x=d.msg.split(" ").slice(1,4);
		TTS.userVoices[d.user]=[x[0].toLowerCase(),x[1]?TTS.between(parseFloat(x[1]),.75,1.5):1,x[2]?TTS.between(parseFloat(x[2]),.75,1.5):1];
		localStorage.setItem("user_voices",JSON.stringify(TTS.userVoices));
	}

	static between(x,min,max){
		return x<min?min:(x>max?max:x)
	}

	static get_user_voice(user){
		if(!TTS.userVoices[user])
			TTS.set_user_voice(user,"spanish",0.8+.5*Math.random(),0.8+0.5*Math.random())
		return TTS.userVoices[user];
	}

	static set_user_voice(user,voice,pitch,rate){
		TTS.userVoices[user]=[voice,pitch,rate];
		localStorage.setItem("user_voices",JSON.stringify(TTS.userVoices));
	}

	static play(d){
		if(d && (d.params["emote-only"] || !xor_msg(d.params,config.tts)))
			return;
		
		if(d.msg.includes("*quack*")){
			new Audio("./assets/audios/cats/cat"+Math.floor(Math.random()*(1-5)+5)+".mp3").play();
			return;
		}

		TTS.speak_msg(d.user,d.msg)
	}

	static speak_rand(msg){
		let voices=synth.getVoices()
		TTS.speak(msg,TTS.defaultVoice,0.8+.5*Math.random(),0.8+0.5*Math.random());
	}

	static speak_msg(user,msg){
		if(!/\p{L}/u.test(msg))
			return;
		if(TTS.lastVoiceUser!==user){
			TTS.lastVoiceUser=user;
			TTS.speak(user.replaceAll("_"," "),TTS.defaultVoice,1.2,1.2);
		}
		const mVoice=TTS.get_user_voice(user);
		TTS.speak(msg,synth.getVoices().find(e=>e.lang.toLowerCase().includes(mVoice[0]) || e.name.toLowerCase().includes(mVoice[0])),mVoice[1],mVoice[2]);
		//TTS.speak_rand(msg);
	}

	static speak(msg,voice,pitch=1,rate=1){
		var utterThis	=new SpeechSynthesisUtterance(TTS.parse_msg(msg));
		utterThis.volume=config.volume
		utterThis.pitch	=pitch
		utterThis.rate	=rate
		utterThis.voice	=voice
		synth.speak(utterThis);
	}

	static parse_msg(msg){
		return config.speech_urls==2?msg:msg.replace(/((?:(?:https?:\/\/)|(?:www\.))([-A-Z0-9\.]+)([-A-Z0-9+&\?@#\/%=~_\.|]+))/ig,config.speech_urls==1?"$2":"");
	}
}
console.log("aoeu");