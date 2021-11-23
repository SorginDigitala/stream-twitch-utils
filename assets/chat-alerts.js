const config={
	"channels"		:["seyacat","presuntamente"],
	"mode"			:"alerts",

	"alerts"		:{
		"sound_alert"	:"beep",
		"custom_sound"	:"https://sorgindigitala.github.io/stream-twitch-utils/assets/audios/alerts/beep.mp3",
		"volume"		:1,
		"groups"		:[],
		"ignores"		:[]
	},

	"tts"			:{
		"volume"		:1,
		"ignore_urls"	:true,		//ignora las url.
		"short_urls"	:true,		//dice el nombre de dominio, no la url entera.
		"rate_range"	:[.5,2],	//max rate allowed ( https://mdn.github.io/web-speech-api/speak-easy-synthesis/ )
		"pitch_range"	:[0,2],		//max pitch allowed
		"groups"		:[],
		"ignores"		:[],
	},

	"chat"			:{
		"enable"		:false,	//display chat
	},

	"points"			:{
		"enable"		:false,	//enable points events
		"reward_list"	:[],
	},
};

const groups=["broadcaster","vip","moderator","staff","admin","global_mod","viewer"];
var audio_alert=new Audio("");
var ws;



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
	}
	mode_select.value=config.mode;
	mode_select.onchange=e=>{
		//desactivar el modo anterior si lo hubiera
		//activar el nuevo modo si lo hubiera
		//ocultar opciones de los demas modos
	}


	sound_alert.value=config.alerts.sound_alert;
	custom_sound.value=config.alerts.custom_sound;
	sound_alert.onchange=e=>{
		custom_sound.classList.toggle("hide",sound_alert.value!=="custom");
		config.alerts.sound_alert=sound_alert.value;
		audio_alert=new Audio(config.alerts.sound_alert==="custom"?config.alerts.custom_sound:"./assets/audios/alerts/"+config.alerts.sound_alert+".mp3");
		play_alert();
	}
	play_alert.onclick=play_alert;
	sound_alert.onchange();

	alerts_groups.innerHTML=groups.map((e,i)=>"<label><input type=checkbox>"+e+"</label>").join("");
	tts_groups.innerHTML=groups.map((e,i)=>"<label><input type=checkbox>"+e+"</label>").join("");
}

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
		if(e.data.trim().startsWith("PING"))
			ws.send("PONG");
		else{
			console.log(e.data);
			//events.on_message_received(sender,msg);
			audio_alert.play();
		}
	}
}
function ws_join(e){
	ws.send("JOIN #"+e);
}
function ws_leave(e){
	ws.send("PART #"+e);
}



function play_alert(){
	audio_alert.play().then().catch(e=>{
		if(e.name!=="NotAllowedError")// ignorar error de permisos
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