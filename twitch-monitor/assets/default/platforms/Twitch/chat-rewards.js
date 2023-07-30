
//	https://dev.twitch.tv/docs/api/reference#create-custom-rewards
//	Solo recompensas creadas con API pueden ser administradas: https://discuss.dev.twitch.tv/t/refunding-channel-points-error-403/29929/2

class Rewards{
	static rewards={
		"cb9a5657-1ad5-41e6-a939-ae13db69102a":[],
	};

	static start(){
		Events.add("REWARD",Rewards.input);
		//					/*
		fragments.forEach(e=>Rewards.rewards["cb9a5657-1ad5-41e6-a939-ae13db69102a"].push({
			"on"	:true,
			"type"	:"sound",
			"words"	:[e],
			"url"	:"https://sorgindigitala.github.io/stream-twitch-utils/assets/audios/fragments/"+e+".mp3"
		}));
		config.points.rewards=Rewards.rewards;
		Config.save();
		/*/
		Rewards.rewards=config.points.rewards;
		//*/
	}
	

	static input(msg){
		rewards_log.innerHTML+="<div>"+msg.params["custom-reward-id"]+" #"+msg.channel+" <span style='color:"+msg.params.color+"'>"+msg.user+"</span>: <span>"+msg.raw_msg+"</span></div>";
		const rewards=Rewards.rewards[msg.params["custom-reward-id"]];
		if(!rewards || rewards.length===0)
			return;
		const w=msg.msg.split(" ");
		let r=rewards.filter(e=>e.on && e.words.find(o=>w.includes(o)));
		if(r.length===0)
			r=rewards;
		Rewards.play(r[r.length*Math.random()<<0]);
	}

	static play(reward){
		Media.play_sound(reward.url,reward,Rewards.onstart,Rewards.onend);
	}

	static onstart(reward){
		console.log("onstart",reward);
		//	mostrar mensaje
	}

	static onend(reward){
		console.log("onend",reward);
		//	ocultar mensaje
	}
}