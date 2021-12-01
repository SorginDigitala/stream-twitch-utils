
class Log{
	static messages=[];

	static start(){
		["PRIVMSG","CLEARCHAT","CLEARMSG"].forEach(e=>Events.add(e,Log[e]));
		["JOIN","PART","CLEARCHAT"].forEach(e=>Events.add(e,Log.log));
	}

	static PRIVMSG(msg){
		Log.messages.push(msg);
		//falta pasar emotes a imagenes.
		chat.innerHTML+="<div data-msg-id='"+msg.params.id+"' data-user='"+msg.user+"'>#"+msg.channel+" <span style='color:"+msg.params.color+"'>"+msg.user+"</span>: <span>"+msg.raw_msg+"</span></div>";
	}

	static CLEARCHAT(msg){
			chat.querySelectorAll("#chat [data-user='"+msg.raw_msg+"'] span").forEach(x=>x.style="text-decoration:line-through");
	}

	static CLEARMSG(msg){
		const x=chat.querySelector("#chat [data-msg-id='"+msg.params["target-msg-id"]+"'] span:nth-child(2)");
		if(x){
			x.style="text-decoration:line-through";
			log(msg.type,msg.channel,x,msg.msg);
		}
	}

	static log(msg){
		log(msg.type,msg.channel,msg.msg);
	}
}

class Rewards{
	static rewards={
		"cb9a5657-1ad5-41e6-a939-ae13db69102a":[],
	};

	static start(){
		Events.add("REWARD",Rewards.input);
		//					/*
		fragments.forEach(e=>Rewards.rewards["cb9a5657-1ad5-41e6-a939-ae13db69102a"].push({
			"on"	:true,
			"type"	:"sound",
			"words"	:[e],
			"url"	:"https://sorgindigitala.github.io/stream-twitch-utils/assets/audios/fragments/"+e+".mp3"
		}));
		config.points.rewards=Rewards.rewards;
		Config.save();
		/*/
		Rewards.rewards=config.points.rewards;
		//*/
	}
	

	static input(msg){
		log("REWARD",msg.channel,msg.user,msg.params["custom-reward-id"]);
		const rewards=Rewards.rewards[msg.params["custom-reward-id"]];
		if(!rewards || rewards.length===0)
			return;
		const w=msg.msg.split(" ");
		let r=rewards.filter(e=>e.on && e.words.find(o=>w.includes(o)));
		if(r.length===0)
			r=rewards;
		Rewards.play(r[r.length*Math.random()<<0]);
	}

	static play(reward){
		Media.play_sound(reward.url,reward,Rewards.onstart,Rewards.onend);
	}

	static onstart(reward){
		console.log("onstart",reward);
		//	mostrar mensaje
	}

	static onend(reward){
		console.log("onend",reward);
		//	ocultar mensaje
	}
}

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
		if(d && (d.params["emote-only"] || !xor_msg(d.params,config.alerts)))
			return;
		TTS.speak_msg(d.user,d.msg)
	}

	static speak_rand(msg){
		let voices=synth.getVoices()
		TTS.speak(msg,defaultVoice,0.4+.7*Math.random(),0.4+0.7*Math.random());
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