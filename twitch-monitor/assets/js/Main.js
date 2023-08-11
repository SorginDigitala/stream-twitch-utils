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


class Main{
	static async start(){
		await ConfigManager.load();
		PlatformManager.start();
		ModuleManager.start();

		this.checkAudio();

		background.onclick=e=>panel.classList.remove('hide');
		createElement('input',{type:'button',value:'X',id:'hide_button',onclick:e=>panel.classList.add('hide')},panel);
	}

	static checkAudio(){
		new Audio().play().catch(e=>e.name==="NotAllowedError" && permissions_notice.classList.remove('hide'));
		background.onmousedown=()=>{
			background.onmousedown=null;
			permissions_notice.remove();
		};
	}
}

const ACTION_TYPES=["system","chat","action","monetization"];
class Action{
	response;		//	(String)	mensaje original
	platform;		//	(String)	Twitch | Youtube | ...					->	Se podría cambiar por la ref en vez String
	type;			//	(String)	system | chat | action | monetization
	subtype;		//	(String)	msg, subscription (génerico), hypechat (de youtube), bits (de Twitch), ...
	channel;		//	(String)	canal
	id;				//	(String)	id del mensaje
	msg;			//	(String)	mensaje formateado
	raw_msg;		//	(String)	mensaje original
	emoteonly;		//	(Boolean)	el mensaje solo contiene emoticonos?
	sender;			//	(User)		Autor

	constructor(r,p,t,st,c,id,msg,raw_msg,emoteonly,sender=null){
		this.response	=r;
		this.platform	=p;
		this.type		=t;
		this.subtype	=st;
		this.channel	=c;
		this.id			=id;
		this.msg		=msg;
		this.raw_msg	=raw_msg;
		this.emoteonly	=emoteonly;
		this.sender		=sender;
	}
}

class User{
	id;				//	(String)	id del usuario
	username;		//	(String)	nombre público formateado y en minusculas
	displayname;	//	(String)	nombre público
	color;			//	(String)	color
	
	constructor(id,username,displayname,color){
		this.id=id;
		this.username=username;
		this.displayname=displayname;
		this.color=color;
	}
}


new Promise(r=>{window.onload=r}).then(e=>{Main.start()});