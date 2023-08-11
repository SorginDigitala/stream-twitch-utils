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