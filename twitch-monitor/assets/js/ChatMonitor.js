"use strict";

var config,				//	Configuración de usuario
data={					//	Datos de las apps
	modules:[],
	platforms:[],
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





if(document.all)
	window.attachEvent('onload',ChatMonitor.start);
else
	window.addEventListener("load",ChatMonitor.start,false);﻿







class Action{
	platform;
	type;
	channel;
	id;
	msg;
	raw_msg;
	sender;

	constructor(p,t,c,id,msg,raw_msg,sender=null){
		this.platform=p;
		this.type=t;
		this.channel=c;
		this.id=id;
		this.msg=msg;
		this.raw_msg=raw_msg;
		this.sender=sender;
	}
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
	const g=(conf.groups.length===0 || (params.badges && conf.groups.findIndex(x=>params.badges.includes(x))>=0));
	const u=conf.users.includes(params["display-name"].toLowerCase());
	return g^u;
}


function array_toggle(arr,item){	//	https://stackoverflow.com/a/39349118/3875360
	const i=arr.indexOf(item);
	if(i!==-1)
		arr.splice(i,1);
	else
		arr.push(item);
}





function multimenu_click(div,onClick){
	div.querySelectorAll(".menu>*").forEach(b=>{
		b.onclick=e=>{
			let i=0;
			div.querySelectorAll(".menu>*").forEach((b2,i2)=>{
				b2.classList.toggle("on",b===b2);
				if(b===b2)
					i=i2;
			});
			div.querySelectorAll(".content>div").forEach((c,i2)=>c.classList.toggle("hide",i!==i2))
			onClick && onClick(b);
		}
	});
}

