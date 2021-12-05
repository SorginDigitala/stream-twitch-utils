
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

	static start(){
		Groups.display_groups(tts_groups,tts_exceptions,config.tts);
	}

	static enable(b){
		if(b)
			Events.add("PRIVMSG",TTS.play);
		else
			Events.remove("PRIVMSG",TTS.play);
		tts.classList.toggle("hide",!b);
	}

	static play(d){
		if(d && (d.params["emote-only"] || !xor_msg(d.params,config.tts)))
			return;
		TTS.speak_msg(d.user,d.msg)
	}

	static speak_rand(msg){
		let voices=synth.getVoices()
		TTS.speak(msg,defaultVoice,0.8+.5*Math.random(),0.8+0.5*Math.random());
		//TTS.speak(msg,voices[Math.floor(Math.random() * voices.length)],0.4+.7*Math.random(),0.4+0.7*Math.random());
	}

	static speak_msg(user,msg){
		if(TTS.lastVoiceUser!==user){
			TTS.lastVoiceUser=user;
			TTS.speak(user,defaultVoice);
		}
		TTS.speak_rand(msg);
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