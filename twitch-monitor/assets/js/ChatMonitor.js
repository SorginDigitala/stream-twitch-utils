"use strict";

var config,				//	Configuración de usuario
data={					//	Datos de las apps
	modules:[],
	platforms:[],
	apps:[],
	media:[]
},
platforms={},			//	Referencia a las plataformas
modules={},				//	Referencia a los módulos
apps={};				//	Referencia a las aplicaciones


class ChatMonitor{
	static async start(){
		await ConfigManager.load();
		ModuleManager.start();
		PlatformManager.start();

		ChatMonitor.checkAudio();

		background.onclick=e=>panel.classList.remove('hide');
		createElement('input',{type:'button',value:'X',id:'hide_button',onclick:e=>panel.classList.add('hide')},panel);
	}

	static checkAudio(){
		//			/*
		new Audio().play().catch(e=>e.name==="NotAllowedError" && permissions_notice.classList.remove('hide'));
		background.onmousedown=()=>{
			background.onmousedown=null;
			permissions_notice.remove();
		};
		/*/
		//	Esto no funciona, por alguna razón.
		const timer=setInterval(async ()=>{
			await (new Audio().play()).then(e=>{
				permissions_notice.remove();
				clearInterval(timer);
			}).catch(e=>{
				console.log(e.name);
				if(e.name==="NotAllowedError")
					permissions_notice.classList.toggle("hide",false);
			});
		},100);
		//*/
	}
}


class Action{
	platform;		//	Twitch | Youtube | ...
	type;			//	system | chat | action | monetization
	channel;		//	canal
	id;				//	id del mensaje
	msg;			//	mensaje formateado
	raw_msg;		//	mensaje original
	clean_msg;		//	mensaje limpio, solo texto (no emotes)
	sender;			//	{id,username,color}
	response;		//	mensaje original

	constructor(r,p,t,c,id,msg,raw_msg,sender=null){
		this.response	=r;
		this.platform	=p;
		this.type		=t;
		this.channel	=c;
		this.id			=id;
		this.msg		=msg;
		this.raw_msg	=raw_msg;
		this.sender		=sender;
	}
}



if(document.all)
	window.attachEvent('onload',ChatMonitor.start);
else
	window.addEventListener("load",ChatMonitor.start,false);﻿