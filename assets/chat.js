//	Si se usa una versión vieja de la variable "config" podría dar error. Sería mejor usar una función que compare la config por defecto y la almacenada
const config=localStorage.getItem("config_alerts")?JSON.parse(localStorage.getItem("config_alerts")):{
	"channels"		:["seyacat"],
	"mode"			:"alerts",
	"volume"		:1,
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
		"groups"		:[],//["vip","moderator"],
		"users"			:["streamelements","nightbot","moobot"],
	},

	"events"			:{
		"event_list"	:[],
	},

	"points"			:{
		"reward_list"	:[],
	},
};

const sounds		=["beep","bell","door","door2","wololo"];
const fragments		=["alexa","antivacunas","bitcoin","capitalismo","descarga","evaristo","followers","google","izquierda","jetset","juventud","lola","provacunas","rapero","repsol","subnormal","tinder","wallhack"];
const videos		=[];
var log_grouplist	=[
	"moderator","vip","founder","subscriber","sub-gifter","sub-gift-leader","bits","bits-leader","anonymous-cheerer","predictions","hype-train",
	//"broadcaster","partner","turbo","premium","staff","admin",
	//"bits-charity","twitchcon2017","twitchconEU2019","twitchconNA2019","glitchcon2020","twitchconAmsterdam2020","glhf-pledge",
	//"H1Z1_1","overwatch-league-insider_1","overwatch-league-insider_2018B","overwatch-league-insider_2019A"
];

const synth			=window.speechSynthesis;
const defaultVoice	=synth.getVoices().find(e=>e.default);
var audio_alert;
var ws;

//	https://dev.twitch.tv/docs/eventsub/handling-webhook-events#list-of-request-headers

function start_ws(){
	ws=new WebSocket("wss://irc-ws.chat.twitch.tv/");
	ws.onerror=e=>console.log("[irc-ws.chat] error:",e);
	ws.onopen=e=>{
		ws_status.classList.toggle("on",true);
		log("WS connected");
		ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands");//se requiere para obtener info sobre los chatters: https://dev.twitch.tv/docs/irc/guide
		ws.send("PASS SCHMOOPIIE");
		ws.send("NICK justinfan29530");
		ws.send("USER justinfan29530 8 * :justinfan29530");
		config.channels.forEach(e=>ws_join(e));
	};
	ws.onclose=e=>{
		if(ws_status.classList.contains("on")){
			log("WS disconnected");
			ws_status.classList.toggle("on",false);
		}
		setTimeout(start_ws,1000);
	};
	ws.onmessage=e=>{
		const lines=e.data.trim().split(/[\r\n]+/g);
		lines.forEach(l=>{
			if(l.startsWith("PING")){
				ws.send("PONG");
				return;
			}
			let x=Twitch.msg(l);
			if(x)
				TwitchEvents.input(x);
		})
	}
}
function ws_join(e){
	ws.send("JOIN #"+e);
}
function ws_leave(e){
	ws.send("PART #"+e);
}


function log(action,channel,user,data){
	let msg="["+action+"]";
	if(channel){
		msg+=" #"+channel;
		if(user){
			msg+=" "+user;
			if(data)
				msg+=": "+data;
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

String.prototype.splice = function(start,length,replacement) {
    return this.substr(0,start)+replacement+this.substr(start+length);
}


function xor_msg(params,conf){
	let g=(conf.groups.length===0 || (params.badges && conf.groups.findIndex(x=>params.badges.includes(x))>=0));
	let u=conf.users.includes(params["display-name"].toLowerCase());
	return g^u;
}


function array_toggle(arr,item){	//	https://stackoverflow.com/a/39349118/3875360
	var i=arr.indexOf(item);
	if(i!==-1)
		arr.splice(i,1);
	else
		arr.push(item);
}







class Config{
	static start(){
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
			Config.save();
		}
		mode_select.value=config.mode;
		mode_select.onchange=e=>{
			if(e){
				config.mode=mode_select.value;
				Config.save();
			}
			Alerts.enable(config.mode==="alerts");
			TTS.enable(config.mode==="tts");
		}
		mode_select.onchange();

		speech_urls.value=config.speech_urls;
		speech_urls.onchange=e=>{config.speech_urls=speech_urls.value;Config.save()};

		config_volume.value=config.volume*100;
		config_volume.onchange=e=>{
			config.volume=config_volume.value/100;
			Alerts.set_volume();
			Media.set_volume();
			Config.save();
		}
		clear_config.onclick=e=>{Config.clear();location=""};
	}
	static save(){
		localStorage.setItem("config_alerts",JSON.stringify(config));
	}

	static clear(){
		localStorage.clear();
	}
}

function Loader(){
	Config.start();
	TwitchEvents.start();
	Log.start();
	Groups.start();
	Rewards.start();
	Alerts.start();
	TTS.start();
	start_ws();
}
if(document.all)
	window.attachEvent('onload',Loader);
else
	window.addEventListener("load",Loader,false);﻿