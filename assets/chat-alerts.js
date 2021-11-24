//	Si se usa una versión vieja de la variable "config" podría dar error. Sería mejor usar una función que compare la config por defecto y la almacenada
const config=localStorage.getItem("config_alerts")?JSON.parse(localStorage.getItem("config_alerts")):{
	"channels"		:["seyacat","presuntamente"],
	"mode"			:"alerts",
	"volume"		:100,
	"speech_urls"	:"domain",

	"alerts"		:{
		"sound_alert"	:"beep",
		"custom_sound"	:"https://sorgindigitala.github.io/stream-twitch-utils/assets/audios/alerts/beep.mp3",
		"groups"		:[],
		"users"			:[]
	},

	"tts"			:{
		"ignore_urls"	:true,		//ignora las url.
		"short_urls"	:true,		//dice el nombre de dominio, no la url entera.
		"rate_range"	:[.5,2],	//max rate allowed ( https://mdn.github.io/web-speech-api/speak-easy-synthesis/ )
		"pitch_range"	:[0,2],		//max pitch allowed
		"groups"		:[],
		"users"			:["streamelements","nightbot"],
	},

	"points"			:{
		"enable"		:false,	//enable points events
		"reward_list"	:[],
	},
};

var log_grouplist=[
	"broadcaster","moderator","vip","subscriber","sub-gifter","sub-gift-leader","bits","bits-leader","hype-train","predictions","partner","turbo","premium",
	"bits-charity","glitchcon2020","glhf-pledge","overwatch-league-insider_2019A","twitchconAmsterdam2020","overwatch-league-insider_2018B"
];
const sounds=["beep","bell","door","door2","wololo"];
var audio_alert=new Audio("");
var ws;



function config_save(){
	localStorage.setItem("config_alerts",JSON.stringify(config));
}

function load_config(){
	background.onmousedown=e=>panel.classList.toggle("hide");
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

	alerts_groups.value=config.alerts.groups.join(", ");
	alerts_groups.onchange=e=>{
		config.alerts.groups=channels_to_array(alerts_groups.value);
		config_save();
	};
	alerts_exceptions.value=config.alerts.users.join(", ");
	alerts_exceptions.onchange=e=>{
		config.alerts.users=channels_to_array(alerts_exceptions.value);
		config_save();
	};
	tts_groups.value=config.tts.groups.join(", ");
	tts_groups.onchange=e=>{
		config.tts.groups=channels_to_array(tts_groups.value);
		config_save();
	};
	tts_exceptions.value=config.tts.users.join(", ");
	tts_exceptions.onchange=e=>{
		config.tts.users=channels_to_array(tts_exceptions.value);
		config_save();
	};

	log_groups.value=log_grouplist.join(", ");
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
display-name// display name
emotes		// emotes usados y la posición de inicio y final en el mensaje
badges		// lista de insignias
turbo		// si tiene turbo
subscriber	// si es suscriptor
mod			// si es mod
emotes-only	// si el mensaje solo contiene emotes
first-msg	// si es su primer mensaje

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

hosting:		@msg-id=host_on :tmi.twitch.tv NOTICE #nicro4fun :Now hosting kaku924. host_on :tmi.twitch.tv NOTICE #nicro4fun :Now hosting kaku924.
hosting off:	@msg-id=host_target_went_offline :tmi.twitch.tv NOTICE #rhomita :demiontus has gone offline. Exiting host mode. host_target_went_offline :tmi.twitch.tv NOTICE #rhomita :demiontus has gone offline. Exiting host mode.

emotes-only:	@emote-only=1;room-id=30857876 :tmi.twitch.tv ROOMSTATE #folagorlives undefined
suboff:			@msg-id=subs_off :tmi.twitch.tv NOTICE #westcol :This room is no longer in subscribers-only mode. subs_off :tmi.twitch.tv NOTICE #westcol :This room is no longer in subscribers-only mode.


sub:	 @badge-info=subscriber/11;badges=subscriber/9;color=#4E7597;display-name=gabbocastle;emotes=;flags=;id=f6c19fed-154f-4f9c-a671-05d059e84a54;login=gabbocastle;mod=0;msg-id=resub;msg-param-cumulative-months=11;msg-param-months=0;msg-param-multimonth-duration=0;msg-param-multimonth-tenure=0;msg-param-should-share-streak=0;msg-param-sub-plan-name=Élite\sde\sla\sélite;msg-param-sub-plan=1000;msg-param-was-gifted=false;room-id=30651868;subscriber=1;system-msg=gabbocastle\ssubscribed\sat\sTier\s1.\sThey've\ssubscribed\sfor\s11\smonths!;tmi-sent-ts=1637699628747;user-id=496385231;user-type= :tmi.twitch.tv USERNOTICE #elrichmc
sub:	 @badge-info=;badges=premium/1;color=;display-name=nacho_soler;emotes=;flags=;id=abc5db39-f2e5-4401-aed8-bf3735d2b668;login=nacho_soler;mod=0;msg-id=sub;msg-param-cumulative-months=1;msg-param-months=0;msg-param-multimonth-duration=0;msg-param-multimonth-tenure=0;msg-param-should-share-streak=0;msg-param-sub-plan-name=H4x0r;msg-param-sub-plan=Prime;msg-param-was-gifted=false;room-id=494686511;subscriber=1;system-msg=nacho_soler\ssubscribed\swith\sPrime.;tmi-sent-ts=1637700802996;user-id=214336286;user-type= :tmi.twitch.tv USERNOTICE #s4vitaar
subgift:	 @badge-info=subscriber/26;badges=moderator/1,subscriber/24,sub-gifter/50;color=#FF69B4;display-name=Taquitazo;emotes=;flags=;id=890175f9-f175-48ff-ba98-e986c7c8a864;login=taquitazo;mod=1;msg-id=subgift;msg-param-gift-months=1;msg-param-months=2;msg-param-origin-id=d6\s39\s29\sd4\s5e\s0f\s32\s69\s86\sf1\s52\s13\s34\s71\s3b\se9\s4d\s53\sfc\s1e;msg-param-recipient-display-name=Ader04120;msg-param-recipient-id=182974601;msg-param-recipient-user-name=ader04120;msg-param-sender-count=0;msg-param-sub-plan-name=Gentecilla\s(nicro4fun);msg-param-sub-plan=1000;room-id=153594349;subscriber=1;system-msg=Taquitazo\sgifted\sa\sTier\s1\ssub\sto\sAder04120!;tmi-sent-ts=1637710546224;user-id=127959084;user-type=mod :tmi.twitch.tv USERNOTICE #nicro4fun subgift
submysterygift:	 @badge-info=subscriber/26;badges=moderator/1,subscriber/24,sub-gifter/50;color=#FF69B4;display-name=Taquitazo;emotes=;flags=;id=6d19d5a5-ce3c-4bfb-bcfa-31b4918058c5;login=taquitazo;mod=1;msg-id=submysterygift;msg-param-mass-gift-count=3;msg-param-origin-id=d6\s39\s29\sd4\s5e\s0f\s32\s69\s86\sf1\s52\s13\s34\s71\s3b\se9\s4d\s53\sfc\s1e;msg-param-sender-count=63;msg-param-sub-plan=1000;room-id=153594349;subscriber=1;system-msg=Taquitazo\sis\sgifting\s3\sTier\s1\sSubs\sto\snicro4fun's\scommunity!\sThey've\sgifted\sa\stotal\sof\s63\sin\sthe\schannel!;tmi-sent-ts=1637710543777;user-id=127959084;user-type=mod :tmi.twitch.tv USERNOTICE #nicro4fun submysterygift
raid:	@badge-info=;badges=;color=#8A2BE2;display-name=ManzDev;emotes=;flags=;id=068be18a-ee52-48bb-961b-c391424b5cc3;login=manzdev;mod=0;msg-id=raid;msg-param-displayName=ManzDev;msg-param-login=manzdev;msg-param-profileImageURL=https://static-cdn.jtvnw.net/jtv_user_pictures/86bd7a3b-b42f-4463-a428-e3f8d0614208-profile_image-70x70.png;msg-param-viewerCount=46;room-id=494686511;subscriber=0;system-msg=46\sraiders\sfrom\sManzDev\shave\sjoined!;tmi-sent-ts=1637699495632;user-id=504185570;user-type= :tmi.twitch.tv USERNOTICE #s4vitaar

nidea:  @login=pa4b;room-id=;target-msg-id=8667393d-5677-4479-87af-a21dbe663338;tmi-sent-ts=1637700375095 :tmi.twitch.tv CLEARMSG #elrichmc :ah ): vrga
*/
function start_ws(){
	ws=new WebSocket("wss://irc-ws.chat.twitch.tv/");
	ws.onerror=e=>console.log("[irc-ws.chat] error:",e);
	ws.onopen=e=>{
		ws_status.classList.toggle("on",true);
		console.log("[irc-ws.chat] open");
		ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands");//se requiere para obtener info sobre los chatters
		ws.send("PASS SCHMOOPIIE");
		ws.send("NICK justinfan29530");
		ws.send("USER justinfan29530 8 * :justinfan29530");
		config.channels.forEach(e=>ws_join(e));
	};
	ws.onclose=e=>{
		ws_status.classList.toggle("on",false);
		console.log("[irc-ws.chat] closed");
		//try to reconnect (?)
	};
	ws.onmessage=e=>{
		const lines=e.data.trim().split(/[\r\n]+/g);
		lines.forEach(l=>{
			l=l.trim();
			if(l.startsWith("PING")){
				ws.send("PONG");
				//log("Ping");
			}else if(l[0]==="@"){
				const params=Object.fromEntries(l.substring(1).split(";").map(x=>x.split("=")));
				get_badges(params);
				if(!l.includes("PRIVMSG") && !["sub","resub","raid"].includes(params["msg-id"]))
					console.log(params,l,params["msg-id"]);
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
		if(e.name==="NotAllowedError"){
			// ignorar error de permisos. Quizá un mensaje de aviso no estaría mal.
		}else
			console.error("error",e.name);
	});
}

function channels_to_array(v){
	return v.split(",").map(c=>normalize_channel(c)).filter((c,i,a)=>a.indexOf(c)===i)
}

function normalize_channel(c){
	return c.trim().toLowerCase();
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







function Loader(){
	load_config();
	start_ws();
}

if(document.all)
	window.attachEvent('onload',Loader);
else
	window.addEventListener("load",Loader,false);﻿