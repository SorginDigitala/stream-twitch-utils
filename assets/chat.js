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
		"groups"		:["vip","moderator"],
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

class Twitch{
	static pattern=/(.*?):(?:([a-zA-Z0-9_]{4,25}![a-zA-Z0-9_]{4,25}@[a-zA-Z0-9_]{4,25}.tmi.twitch.tv)|tmi.twitch.tv) (JOIN?|PART?|PRIVMSG?|CLEARMSG?|CLEARCHAT?|HOSTTARGET?|NOTICE?|USERSTATE?|USERNOTICE?|ROOMSTATE?|GLOBALUSERSTATE?) (?:#([a-zA-Z0-9_]{4,25}))[?:\s:]{0,}(.*?)$/si

	static msg(msg){
		const x=msg.match(Twitch.pattern);
		if(!x){
			console.log(msg);
			return;
		}
		const params=Twitch.get_params(x[1]);
		let data={
			type	:x[3],
			channel	:x[4],
			user	:x[2]?x[2].split("!")[0]:"",
			raw_msg	:x[5],
			msg		:Twitch.clear_emotes(x[5],params),
			params	:params,
		}
		//console.log(data);
		return data;
	}

	static get_params(l){
		let params=Object.fromEntries(l.substring(1).split(";").map(x=>x.split("=")));
		Twitch.get_badges(params);
		return params;
	}

	static get_badges(params){
		if(params.badges){
			params.badges=params.badges.split(",").map(e=>e.split("/")[0]);
			params.badges.forEach(e=>{
				if(!log_grouplist.includes(e)){
					log_grouplist.push(e);
					Groups.update();
				}
			});
		}
	}

	static clear_emotes(msg,params){
		if(params.emotes){
			let emotes=params.emotes.split("/").reverse().map(x=>x.split(":").map(y=>y.split(",").map(z=>z.split("-"))));
			emotes.forEach(x=>x[1].forEach(y=>{const size=parseInt(y[1])+2-parseInt(y[0]);msg=msg.splice(parseInt(y[0]),size," ".repeat(size))}));
		}
		return msg.replace(/\s{2,}/g," ").trim();
	}

	
}

/*
Twitch.msg("@badge-info=subscriber/14;badges=moderator/1,subscriber/0;client-nonce=ef99b1d9f606cea809c1c4ec2989add4;color=#2E8B57;display-name=Presuntamente;emotes=;first-msg=0;flags=;id=e435cf16-7508-417f-a02e-1bb7fd067872;mod=1;room-id=194927077;subscriber=1;tmi-sent-ts=1638042827616;turbo=0;user-id=488234266;user-type=mod :presuntamente!presuntamente@presuntamente.tmi.twitch.tv PRIVMSG #seyacat :test")
Twitch.msg(":justinfan29530!justinfan29530@justinfan29530.tmi.twitch.tv JOIN #demiontus");
Twitch.msg(":justinfan29530!justinfan29530@justinfan29530.tmi.twitch.tv PART #demiontus");
Twitch.msg(":tmi.twitch.tv HOSTTARGET #demiontus :rhomita 4");
Twitch.msg("@badge-info=subscriber/14;badges=moderator/1,subscriber/0;client-nonce=5423e4bb60671815736a7b42f069fb0f;color=#2E8B57;display-name=Presuntamente;emotes=303422392:33-42/306427250:44-55/307610478:57-65/303662944:7-18,20-31;first-msg=0;flags=;id=28b9e402-2d9c-484b-9a26-156099faf9d1;mod=1;room-id=194927077;subscriber=1;tmi-sent-ts=1638050907354;turbo=0;user-id=488234266;user-type=mod :presuntamente!presuntamente@presuntamente.tmi.twitch.tv PRIVMSG #seyacat :inicio presun9Among presun9Among rafalaTONE pedros27Humo tamayo4XD fin");
Twitch.msg("@emote-only=0;followers-only=-1;r9k=0;rituals=0;room-id=130747120;slow=0;subs-only=0 :tmi.twitch.tv ROOMSTATE #rhomita");
Twitch.msg("@ban-duration=5;room-id=494686511;target-user-id=664042355;tmi-sent-ts=1637699597872 :tmi.twitch.tv CLEARCHAT #s4vitaar :vpabloa");
Twitch.msg("@login=owen20202021;room-id=;target-msg-id=6b9ee65f-e0b2-4d74-b35c-669bf129ebda;tmi-sent-ts=1637762922034 :tmi.twitch.tv CLEARMSG #folagorlives :gran stream");
*/

class TwitchEvents{	//	https://dev.twitch.tv/docs/irc/tags
	static event_list=[
		"JOIN","PART","PRIVMSG","CLEARCHAT","CLEARMSG","HOSTTARGET",
		"highlighted-message","sub","resub","subgift","anonsubgift","submysterygift","giftpaidupgrade","rewardgift","anongiftpaidupgrade","raid","unraid","ritual","bitsbadgetier"
	];
	static events={};
	static ignore=["ROOMSTATE"];

	static start(){
		//Events.add("any",TwitchEvents.input);
	}

	static update(){
		//config -> TwitchEvents.events;
	}

	static input(e){
		Events.dispatch(e.type,e);

		if(e.type==="PRIVMSG" && e.params["custom-reward-id"])
			Events.dispatch("REWARD",e);

/*
		if(e.params["custom-reward-id"])
			Events.dispatch("reward",e);
		else if(e.params["first-msg"]==="1")
			Events.dispatch("first-msg",e);
		else if(e.params["emote-only"])
			Events.dispatch("emote-only",e);
		else
			Events.dispatch(e.type,e);
*/


		if(TwitchEvents.events[e.type])
			TwitchEvents.events[e.type].forEach(e=>{
				//ejecutar mensaje
			});
		if(e.params["msg-id"] && TwitchEvents.events[e.params["msg-id"]])
			TwitchEvents.events[e.type].forEach(e=>{
				//ejecutar mensaje
			});
		if(!TwitchEvents.ignore.includes(e.type) && (!TwitchEvents.event_list.includes(e.type) || e.params["msg-id"] && !TwitchEvents.event_list.includes(e.params["msg-id"])))
			console.log(e.type,e.params["msg-id"]);
	}
}

class Groups{
	static start(){
		popup_groups.querySelector("[name=close]").onclick=e=>Groups.hide();
		popup_groups.onclick=e=>{e.target===e.currentTarget && Groups.hide()};
		alerts_groups.onclick=e=>Groups.display(config.alerts.groups,alerts_groups);
		tts_groups.onclick=e=>Groups.display(config.tts.groups,tts_groups);
		Groups.update();
	}

	static update(){
		[config.alerts.groups,config.tts.groups].forEach(e=>e.forEach(x=>{
			if(!log_grouplist.includes(x))
				log_grouplist.push(x);
		}));
		group_list.innerHTML=log_grouplist.map((e,i)=>"<label><input type=checkbox name="+e+">"+e+"</label>").join("");
	}

	static display_groups(input,textarea,arr){
		input.value=arr.groups.join(", ");
		input.onchange=e=>{
			arr.groups=channels_to_array(input.value);
			Groups.update();
			Config.save();
		};
		textarea.value=arr.users.join(", ");
		textarea.onchange=e=>{
			arr.users=channels_to_array(textarea.value);
			Config.save();
		};
	}

	static display(arr,input){
		group_list.querySelectorAll("input").forEach(e=>{
			e.checked=arr.includes(e.name);
			e.onchange=(e=>{
				array_toggle(arr,e.target.name);
				input.value=arr.join(", ");
				Config.save();
			});
		});
		popup_groups.classList.remove("hide");
		document.addEventListener('keydown',Groups.hide);
	}

	static hide(e){
		if(e && e.keyCode!==27)
			return;
		popup_groups.classList.add("hide");
		document.removeEventListener('keydown',Groups.hide);
	}
}



class Media{
	static list=[];
	static current;

	static start(){
		//	hay que pensar en como agregar un video player de una forma elegante, con absolute y centrado.
		//	https://stackoverflow.com/questions/15286407/in-javascript-what-is-the-video-equivalent-of-new-audio/49558085
	}

	static play(){
		if(Media.current && !Media.current.content.paused || Media.list.length===0)
			return;
		Media.current=Media.list.shift();
		Media.current.content.onended=e=>{Media.current.onend(Media.current.data);Media.play()};
		Media.set_volume();
		Media.current.onstart(Media.current.data);
		Media.current.content.play();
	}

	static play_sound(url,data,onstart,onend){
		//comprobar si la url existe.
		Media.list.push({
			type		:"audio",
			content		:new Audio(url),
			"data"		:data,
			"onstart"	:onstart,
			"onend"		:onend,
		});
		Media.play();
	}

	static play_video(url){
		//comprobar si la url existe.
	}

	static set_volume(){
		if(Media.current)
			Media.current.content.volume=config.volume;
	}
}
/*
document.body.onclick=e=>{
	Media.play_sound("file:///C:/Users/c/Desktop/NodeJS/stream-twitch-utils/assets/audios/alerts/beep.mp3");
	Media.play_sound("file:///C:/Users/c/Desktop/NodeJS/stream-twitch-utils/assets/audios/alerts/beep.mp3");
	Media.play_sound("file:///C:/Users/c/Desktop/NodeJS/stream-twitch-utils/assets/audios/alerts/wololo.mp3");
	Media.play_sound("file:///C:/Users/c/Desktop/NodeJS/stream-twitch-utils/assets/audios/alerts/beep.mp3");
}
*/


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