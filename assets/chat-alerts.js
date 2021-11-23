const config=localStorage.getItem("config_alerts")?JSON.parse(localStorage.getItem("config_alerts")):{
	"channels"		:["seyacat","presuntamente"],
	"mode"			:"alerts",
	"volume"		:100,
	"speech_urls"	:"domain",

	"alerts"		:{
		"sound_alert"	:"beep",
		"custom_sound"	:"https://sorgindigitala.github.io/stream-twitch-utils/assets/audios/alerts/beep.mp3",
		"groups"		:["vip","moderator","staff","admin","global_mod","viewer"],
		"users"			:[]
	},

	"tts"			:{
		"ignore_urls"	:true,		//ignora las url.
		"short_urls"	:true,		//dice el nombre de dominio, no la url entera.
		"rate_range"	:[.5,2],	//max rate allowed ( https://mdn.github.io/web-speech-api/speak-easy-synthesis/ )
		"pitch_range"	:[0,2],		//max pitch allowed
		"groups"		:["vip","moderator","staff","admin","global_mod","viewer"],
		"users"			:["streamelements","nightbot"],
	},

	"chat"			:{
		"enable"		:false,	//display chat
	},

	"points"			:{
		"enable"		:false,	//enable points events
		"reward_list"	:[],
	},
};
/*
Si se usa una versión vieja de la variable "config" podría dar error. Sería mejor usar una función que compare la config por defecto y la almacenada
*/

const groups=["broadcaster","vip","moderator","staff","admin","global_mod","viewer"];
var audio_alert=new Audio("");
var ws;



function config_save(){
	localStorage.setItem("config_alerts",JSON.stringify(config));
}

function load_config(){
	document.body.onclick=e=>{panel.classList.toggle("hide",false)}
	hide_button.onclick=e=>{e.stopPropagation();panel.classList.toggle("hide",true)}

	channel_form.querySelector("[name='channels'").value=config.channels.join(", ");
	channel_form.onsubmit=e=>{
		e.preventDefault();
		let channels=channel_form.querySelector("[name='channels'").value.split(",");
		channels.forEach((c,i)=>channels[i]=normalize_channel(c));
		const leave=config.channels.filter(c=>!channels.includes(c));
		const join=channels.filter(c=>!config.channels.includes(c));
		config.channels=channels;
		leave.forEach(c=>ws_leave(c));
		join.forEach(c=>ws_join(c));
		config_save();
	}
	mode_select.value=config.mode;
	mode_select.onchange=e=>{
		//desactivar el modo anterior si lo hubiera
		//activar el nuevo modo si lo hubiera
		config.mode=mode_select.value;
		alerts.classList.toggle("hide",config.mode!=="alerts");
		tts.classList.toggle("hide",config.mode!=="tts");
		config_save();
	}
	mode_select.onchange();

	speech_urls.value=config.speech_urls;
	speech_urls.onchange=e=>{config.speech_urls=speech_urls.value;config_save()};


	sound_alert.value=config.alerts.sound_alert;
	custom_sound.value=config.alerts.custom_sound;
	sound_alert.onchange=e=>{
		custom_sound.classList.toggle("hide",sound_alert.value!=="custom");
		config.alerts.sound_alert=sound_alert.value;
		audio_alert=new Audio(config.alerts.sound_alert==="custom"?config.alerts.custom_sound:"./assets/audios/alerts/"+config.alerts.sound_alert+".mp3");
		audio_alert.volume=config.volume/100;
		play_alert();
		config_save();
	}
	alert_test.onclick=play_alert;
	sound_alert.onchange();

	config_volume.value=config.volume;
	config_volume.onchange=e=>{
		audio_alert.volume=config_volume.value/100;
		config.volume=config_volume.value;
		config_save();
	}

	display_groups(alerts_groups,config.alerts.groups);
	alerts_exceptions.value=config.alerts.users.join(", ");
	display_groups(tts_groups,config.tts.groups);
	tts_exceptions.value=config.tts.users.join(", ");
}


function display_groups(content,arr){
	content.innerHTML=groups.map((e,i)=>"<label><input type=checkbox name="+e+""+(arr.includes(e)?" checked":"")+">"+e+"</label>").join("");
	content.querySelectorAll("input").forEach(e=>{
		e.onchange=(e=>{
			array_toggle(arr,e.target.name);
			config_save();
		});
	});
}
function array_toggle(arr,item){	//	https://stackoverflow.com/a/39349118/3875360
	var i=arr.indexOf(item);
	if(i!==-1)
		arr.splice(i,1);
	else
		arr.push(item);
}

/*
attr:
emotes		// emotes usados y la posición de inicio y final en el mensaje
badges		// lista de insignias - broadcaster/1,moderator/1,subscriber/0,bits/1000,sub-gifter/1,vip/1,premium/1,partner/1,glitchcon2020/1
turbo		// si tiene turbo (?)
subscriber	// si es suscriptor
mod			// si es mod
emotes-only	// si el mensaje solo contiene emotes
first-msg	// si es su primer mensaje
display-name// display name

badge-info	// si es suscriptor / meses
user-type	// tipo de usuario (por ahora solo devuelve "mod" en caso de ser moderador)

reply-parent-display-name
reply-parent-msg-id
reply-parent-user-id
reply-parent-user-login


msgs:
:justinfan29530!justinfan29530@justinfan29530.tmi.twitch.tv JOIN #demiontus
:justinfan29530!justinfan29530@justinfan29530.tmi.twitch.tv PART #demiontus
:tmi.twitch.tv HOSTTARGET #demiontus :rhomita 4
*/
function start_ws(){
	ws=new WebSocket("wss://irc-ws.chat.twitch.tv/");
	ws.onopen=e=>{
		console.log("[irc-ws.chat] open");
		ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands");//se requiere para obtener info sobre los chatters
		ws.send("PASS SCHMOOPIIE");
		ws.send("NICK justinfan29530");
		ws.send("USER justinfan29530 8 * :justinfan29530");

		config.channels.forEach(e=>ws_join(e));
	};
	ws.onclose=e=>{
		console.log("[irc-ws.chat] closed");
		//try to reconnect
	};
	ws.onerror=e=>{
		console.log("[irc-ws.chat] error:",e);
	};
	ws.onmessage=e=>{
		const lines=e.data.trim().split(/[\r\n]+/g);
		lines.forEach(l=>{
			l=l.trim();
			if(l.startsWith("PING")){
				ws.send("PONG");
				//log("Ping");
			}else if(l[0]==="@"){
				const params=l.substring(1).split(";").map(p=>p.split("="));
				if(params.turbo)
					console.log(params);
				//events.on_message_received(sender,msg);
				audio_alert.play();
			}else
			//if(l[0]!==":")
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


function play_alert(){
	audio_alert.play().then().catch(e=>{
		if(e.name!=="NotAllowedError")// ignorar error de permisos. Quizá un mensaje de aviso no estaría mal.
			console.error("error");
	});
}

function normalize_channel(c){
	return c.trim().toLowerCase();
}








function Loader(){
	load_config();
	start_ws();
}

if(document.all)
	window.attachEvent('onload',Loader);
else
	window.addEventListener("load",Loader,false);﻿