
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