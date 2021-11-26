//	Si se usa una versión vieja de la variable "config" podría dar error. Sería mejor usar una función que compare la config por defecto y la almacenada
const config=localStorage.getItem("config_alerts")?JSON.parse(localStorage.getItem("config_alerts")):{
	"channels"		:["seyacat"],
	"mode"			:"alerts",
	"volume"		:100,
	"speech_urls"	:1,				// [0-2] Ignora las url, o lee el dominio, lee la url completa. En el TTS y comandos que ejecuten el TTS.

	"alerts"		:{
		"sound_alert"	:"beep",
		"custom_sound"	:"https://sorgindigitala.github.io/stream-twitch-utils/assets/audios/alerts/bell.mp3",
		"groups"		:[],
		"users"			:[]
	},

	"tts"			:{
		"rate_range"	:[.5,2],	//max rate allowed ( https://mdn.github.io/web-speech-api/speak-easy-synthesis/ )
		"pitch_range"	:[0,2],		//max pitch allowed
		"groups"		:["vip","moderator"],
		"users"			:["streamelements","nightbot"],
	},

	"points"			:{
		"enable"		:false,	//enable points events
		"reward_list"	:[],
	},
};

const synth			=window.speechSynthesis;
const defaultVoice	=synth.getVoices().find(e=>e.default);
const sounds		=["beep","bell","door","door2","wololo"];
const fragments		=["alexa","detector","evaristo","followers","google","jetset","martini","rapero","repsol","subnormal"];
const videos		=[];

var log_grouplist	=[
	"moderator","vip","founder","subscriber","sub-gifter","sub-gift-leader","bits","bits-leader","anonymous-cheerer","predictions","hype-train",
	//"broadcaster","partner","turbo","premium","staff","admin",
	//"bits-charity","twitchcon2017","twitchconEU2019","twitchconNA2019","glitchcon2020","twitchconAmsterdam2020","glhf-pledge",
	//"H1Z1_1","overwatch-league-insider_1","overwatch-league-insider_2018B","overwatch-league-insider_2019A"
];
var audio_alert;
var ws;



function load_config(){
	background.onclick=e=>panel.classList.toggle("hide",false);
	background.onmousedown=e=>permissions_notice.classList.toggle("hide",true);
	hide_button.onclick=e=>{e.stopPropagation();panel.classList.toggle("hide",true)}

	channel_form.querySelector("[name='channels'").value=config.channels.join(", ");
	channel_form.onsubmit=e=>{
		e.preventDefault();
		let channels=channels_to_array(channel_form.querySelector("[name='channels'").value);
		const leave=config.channels.filter(c=>!channels.includes(c));
		const join=channels.filter(c=>!config.channels.includes(c));
		config.channels=channels;
		leave.forEach(c=>ws_leave(c));
		join.forEach(c=>ws_join(c));
		config_save();
	}
	mode_select.value=config.mode;
	mode_select.onchange=e=>{
		if(e){
			config.mode=mode_select.value;
			config_save();
		}
		Alerts.enable(config.mode==="alerts");
		TTS.enable(config.mode==="tts");
	}
	mode_select.onchange();

	speech_urls.value=config.speech_urls;
	speech_urls.onchange=e=>{config.speech_urls=speech_urls.value;config_save()};

	config_volume.value=config.volume;
	config_volume.onchange=e=>{
		audio_alert.volume=config_volume.value/100;
		config.volume=config_volume.value;
		config_save();
	}
	
	Alerts.start();
	TTS.start();


	log_groups.value=log_grouplist.join(", ");
	clear_config.onclick=e=>config_clear();
}

function config_save(){
	localStorage.setItem("config_alerts",JSON.stringify(config));
}
function config_clear(){
	localStorage.clear();
}




/*
attr:
display-name// display name
emotes		// emotes usados y la posición de inicio y final en el mensaje

badges		// lista de insignias
turbo		// si tiene turbo
subscriber	// si es suscriptor
mod			// si es mod

emotes-only	// si el mensaje solo contiene emotes
first-msg	// si es su primer mensaje

custom-reward-id

badge-info	// si es suscriptor / meses
user-type	// tipo de usuario (por ahora solo me ha devuelto "mod" en caso de ser moderador)

reply-parent-display-name
reply-parent-msg-id
reply-parent-user-id
reply-parent-user-login


msgs:
:justinfan29530!justinfan29530@justinfan29530.tmi.twitch.tv JOIN #demiontus
:justinfan29530!justinfan29530@justinfan29530.tmi.twitch.tv PART #demiontus
:tmi.twitch.tv HOSTTARGET #demiontus :rhomita 4

info:	@emote-only=0;followers-only=-1;r9k=0;rituals=0;room-id=130747120;slow=0;subs-only=0 :tmi.twitch.tv ROOMSTATE #rhomita
ban:	@ban-duration=5;room-id=494686511;target-user-id=664042355;tmi-sent-ts=1637699597872 :tmi.twitch.tv CLEARCHAT #s4vitaar :vpabloa
clear:	@login=owen20202021;room-id=;target-msg-id=6b9ee65f-e0b2-4d74-b35c-669bf129ebda;tmi-sent-ts=1637762922034 :tmi.twitch.tv CLEARMSG #folagorlives :gran stream

notice:
hosting:		@msg-id=host_on :tmi.twitch.tv NOTICE #nicro4fun :Now hosting kaku924. host_on :tmi.twitch.tv NOTICE #nicro4fun :Now hosting kaku924.
hosting off:	@msg-id=host_target_went_offline :tmi.twitch.tv NOTICE #rhomita :demiontus has gone offline. Exiting host mode. host_target_went_offline :tmi.twitch.tv NOTICE #rhomita :demiontus has gone offline. Exiting host mode.

emotes-only:	@emote-only=1;room-id=30857876 :tmi.twitch.tv ROOMSTATE #folagorlives undefined
suboff:			@msg-id=subs_off :tmi.twitch.tv NOTICE #westcol :This room is no longer in subscribers-only mode. subs_off :tmi.twitch.tv NOTICE #westcol :This room is no longer in subscribers-only mode.


usernotice:	 @...;msg-id=resub;msg-param-cumulative-months=11;msg-param-months=0;msg-param-multimonth-duration=0;msg-param-multimonth-tenure=0;msg-param-should-share-streak=0;msg-param-sub-plan-name=Élite\sde\sla\sélite;msg-param-sub-plan=1000;msg-param-was-gifted=false;system-msg=gabbocastle\ssubscribed\sat\sTier\s1.\sThey've\ssubscribed\sfor\s11\smonths!;tmi-sent-ts=1637699628747;user-id=496385231;user-type= :tmi.twitch.tv USERNOTICE #elrichmc
subgift:	 @...;msg-id=subgift;msg-param-gift-months=1;msg-param-months=2;msg-param-origin-id=d6\s39\s29\sd4\s5e\s0f\s32\s69\s86\sf1\s52\s13\s34\s71\s3b\se9\s4d\s53\sfc\s1e;msg-param-recipient-display-name=Ader04120;msg-param-recipient-id=182974601;msg-param-recipient-user-name=ader04120;msg-param-sender-count=0;msg-param-sub-plan-name=Gentecilla\s(nicro4fun);msg-param-sub-plan=1000;system-msg=Taquitazo\sgifted\sa\sTier\s1\ssub\sto\sAder04120!;tmi-sent-ts=1637710546224;user-id=127959084;user-type=mod :tmi.twitch.tv USERNOTICE #nicro4fun subgift
submysterygift:	 @...;msg-id=submysterygift;msg-param-mass-gift-count=3;msg-param-origin-id=d6\s39\s29\sd4\s5e\s0f\s32\s69\s86\sf1\s52\s13\s34\s71\s3b\se9\s4d\s53\sfc\s1e;msg-param-sender-count=63;msg-param-sub-plan=1000;system-msg=Taquitazo\sis\sgifting\s3\sTier\s1\sSubs\sto\snicro4fun's\scommunity!\sThey've\sgifted\sa\stotal\sof\s63\sin\sthe\schannel!;tmi-sent-ts=1637710543777;user-id=127959084;user-type=mod :tmi.twitch.tv USERNOTICE #nicro4fun submysterygift
raid:	@...;msg-id=raid;msg-param-displayName=ManzDev;msg-param-login=manzdev;msg-param-profileImageURL=https://static-cdn.jtvnw.net/jtv_user_pictures/86bd7a3b-b42f-4463-a428-e3f8d0614208-profile_image-70x70.png; msg-param-viewerCount=46;system-msg=46\sraiders\sfrom\sManzDev\shave\sjoined!;tmi-sent-ts=1637699495632;user-id=504185570;user-type= :tmi.twitch.tv USERNOTICE #s4vitaar

*/
function start_ws(){
	ws=new WebSocket("wss://irc-ws.chat.twitch.tv/");
	ws.onerror=e=>console.log("[irc-ws.chat] error:",e);
	ws.onopen=e=>{
		ws_status.classList.toggle("on",true);
		console.log("[irc-ws.chat] open");
		ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands");//se requiere para obtener info sobre los chatters.
		ws.send("PASS SCHMOOPIIE");
		ws.send("NICK justinfan29530");
		ws.send("USER justinfan29530 8 * :justinfan29530");
		config.channels.forEach(e=>ws_join(e));
	};
	ws.onclose=e=>{
		ws_status.classList.toggle("on",false);
		console.log("[irc-ws.chat] closed");
		setTimeout(start_ws,1000);
	};
	ws.onmessage=e=>{
		const lines=e.data.trim().split(/[\r\n]+/g);
		lines.forEach(l=>{
			l=l.trim();
			if(l.startsWith("PING")){
				ws.send("PONG");
				//log("Ping");
			}else if(l[0]==="@"){
				const params=get_params(l);
				if(!params["emote-only"] && l.includes("PRIVMSG") && xor_msg(params,config.alerts)){
					Events.dispatch("msg",params);
					console.log(params);
				}

				if(params["custom-reward-id"])
					Events.dispatch("msg.reward",params);
				else if(params["first-msg"])
					Events.dispatch("msg.first-msg",params);
				else if(params["emote-only"])
					Events.dispatch("msg.emote-only",params);
				else if(l.includes("PRIVMSG"))
					Events.dispatch("msg.normal",params);
				if(["sub","resub","raid"].includes(params["msg-id"]))
					console.log(params,l,params["msg-id"]);
			}else if(l[0]===":"){
				//info del canal, como JOIN o PART
			}else
				console.log(l);
		})
	}
}
function ws_join(e){
	ws.send("JOIN #"+e);
}
function ws_leave(e){
	ws.send("PART #"+e);
}

function log(action,channel="",user="",data=""){
	let msg=action;
	if(channel){
		msg+=" - "+channel;
		if(user){
			msg+=" - "+user;
			if(data)
				msg+=": "+user;
		}
	}
	const div=document.createElement("div");
	div.innerText=msg;
	debug_log.append(div);
}


function channels_to_array(v){
	return v.split(",").map(c=>normalize_channel(c)).filter((c,i,a)=>a.indexOf(c)===i && c);
}

function normalize_channel(c){
	return c.trim().toLowerCase();
}

function get_params(l){	// si envian mensaje con ";" da error
	let params=l.substring(1).split(";");
	let last=params[params.length-1].split(":").map(x=>x.trim());
	console.log(l,last,params)
	params[params.length-1]=last[0];
	params=Object.fromEntries(params.map(x=>x.split("=")));
	params.msg_channel=last[1].split("#")[1];
	params.raw_msg=last.slice(2).join(":");
	params.msg=params.raw_msg;

	if(params.emotes){
		let emotes=params.emotes.split("/").reverse().map(x=>x.split(":").map(y=>y.split(",").map(z=>z.split("-"))));
		emotes.forEach(x=>x[1].forEach(y=>{const size=parseInt(y[1])+2-parseInt(y[0]);params.msg=params.msg.splice(parseInt(y[0]),size," ".repeat(size))}));
		params.msg=params.msg.replace(/\s{2,}/g," ").trim();
	}
	

	get_badges(params);
	return params;
}

String.prototype.splice = function(start,length,replacement) {
		console.log(this,start,length,replacement)
    return this.substr(0,start)+replacement+this.substr(start+length);
}


function xor_msg(p,c){
	let g=(c.groups.length===0 || (p.badges && c.groups.findIndex(x=>p.badges.includes(x))>=0));
	let u=c.users.includes(p["display-name"].toLowerCase());
	return g^u;
}

function get_badges(params){
	if(params.badges){
		params.badges=params.badges.split(",").map(e=>e.split("/")[0]);
		params.badges.forEach(e=>{
			if(!log_grouplist.includes(e)){
				log_grouplist.push(e);
				log_groups.value=log_grouplist.join(", ");
			}
		});
	}
}


function display_groups(input,textarea,arr){
	input.value=arr.groups.join(", ");
	input.onchange=e=>{
		arr.groups=channels_to_array(input.value);
		config_save();
	};
	textarea.value=arr.users.join(", ");
	textarea.onchange=e=>{
		arr.users=channels_to_array(textarea.value);
		config_save();
	};
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
			audio_alert.volume=config.volume/100;
			if(e){
				Alerts.play();
				config_save();
			}
		}
		alert_test.onclick=Alerts.play;
		sound_alert.onchange();
		custom_sound.onchange=e=>{config.alerts.custom_sound=custom_sound.value;config_save();};
		display_groups(alerts_groups,alerts_exceptions,config.alerts);
	}
	static enable(b){
		if(b)
			Events.add("msg",Alerts.play);
		else
			Events.remove("msg",Alerts.play);
		alerts.classList.toggle("hide",!b);
	}

	static play(){
		audio_alert.play().then().catch(e=>{
			if(e.name==="NotAllowedError")
				permissions_notice.classList.toggle("hide",false);
			else
				console.error("error",e.name);
		});
	}
}

class TTS{
	static lastVoiceUser;

	static start(){
		display_groups(tts_groups,tts_exceptions,config.tts);
	}
	static enable(b){
		if(b)
			Events.add("msg",TTS.play);
		else
			Events.remove("msg",TTS.play);
		tts.classList.toggle("hide",!b);
	}

	static play(p){
		TTS.speak_msg(p["display-name"],p.msg)
	}

	static speak_rand(msg){
		let voices=synth.getVoices()
		TTS.speak(
			msg,voices[
			Math.floor(Math.random() * voices.length)],
			0.4+.7*Math.random(),0.4+0.7*Math.random());
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
		return msg.replace(/((?:(?:https?:\/\/)|(?:www\.))([-A-Z0-9\.]+)([-A-Z0-9+&@#\/%=~_\.|]+))/ig,"$2");
	}
}






class Events{
	static events={};

	static add(e,f){
		if(typeof f!=="function")
			console.error("Events.Add(string event,function function)",e,f);
		else if(Events.events[e]===undefined)
			Events.events[e]=[f];
		else if(!Events.events[e].includes(f))
			Events.events[e].push(f);
	}

	static remove(e,f){
		if(!Events.events[e])
			return;
		let x=Events.events[e].indexOf(f);
		if(x>-1)
			Events.events[e].splice(x,1);
	}

	static remove_all(e){
		Events.events[e]=[];
	}

	static dispatch(e,p){
		if(Events.events[e])
			Events.events[e].forEach(e=>e(p));
	}
}

function Loader(){
	load_config();
	start_ws();
}
if(document.all)
	window.attachEvent('onload',Loader);
else
	window.addEventListener("load",Loader,false);﻿