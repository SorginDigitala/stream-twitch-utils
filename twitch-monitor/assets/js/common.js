class Events{
	static events={};
	static on(e,f){
		if(typeof f!=="function")
			console.error("Events.on(string event,function function)",e,f)
		else if(!this.events[e])
			this.events[e]=[f]
		else if(!this.events[e].includes(f))
			this.events[e].push(f)
	}

	static remove(e,f){
		if(!this.events[e])
			return;
		let x=this.events[e].indexOf(f)
		if(x>-1)
			this.events[e].splice(x,1)
	}

	static remove_all(e){
		this.events[e]=[]
	}

	static dispatch(...p){
		const e=p.shift();
		//console.log("event",e,...p);
		if(this.events[e])
			this.events[e].forEach(e=>e(...p))
	}
}
window.Events=Events;	//	Para poder llamarse desde Apps


function createElement(type,attrs={},parent=null){
	const e=document.createElement(type);
	Object.entries(attrs).forEach(([k,v])=>e[k]=v);
	parent && parent.append(e);
	return e;
}

function nonce(length){	// https://www.thepolyglotdeveloper.com/2015/03/create-a-random-nonce-string-using-javascript/
	const possible="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let text="";
	for(let i=0;i<length;i++)
		text+=possible.charAt(Math.floor(Math.random()*possible.length));
	return text;
}







class Media{
	static list=[]
	static current

	static start(){
		//	hay que pensar en como agregar un video player de una forma elegante, con absolute y centrado.
		//	https://stackoverflow.com/questions/15286407/in-javascript-what-is-the-video-equivalent-of-new-audio/49558085
	}



	static play(){
		let c=Media.current
		if(c && !c.content.paused || Media.list.length===0)
			return;
		c=Media.list.shift()
		c.content.onended=e=>{c.onend(c.data);Media.play()}
		c.onstart(c.data)
		Media.set_volume()
		c.content.play()
	}

	static play_alert(){
		
	}

	static play_sound(url,data,onstart,onend){
		//comprobar si la url existe.
		Media.list.push({
			"type"		:"audio",
			"content"	:new Audio(url),
			"onstart"	:onstart,
			"onend"		:onend,
			"data"		:data,
		});
		Media.play()
	}

	static play_video(url){
		//comprobar si la url existe.
	}

	static set_volume(){
		if(Media.current)
			Media.current.content.volume=config.volume
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


