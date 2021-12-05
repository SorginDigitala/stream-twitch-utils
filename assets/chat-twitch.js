

class Twitch{
	static pattern=/(.*?):(?:([a-zA-Z0-9_]{4,25}![a-zA-Z0-9_]{4,25}@[a-zA-Z0-9_]{4,25}.tmi.twitch.tv)|tmi.twitch.tv) (JOIN?|PART?|PRIVMSG?|CLEARMSG?|CLEARCHAT?|HOSTTARGET?|NOTICE?|USERSTATE?|USERNOTICE?|ROOMSTATE?|GLOBALUSERSTATE?) (?:#([a-zA-Z0-9_]{4,25}))[?:\s:]{0,}(.*?)$/si

	static msg(msg){
		const x=msg.match(Twitch.pattern);
		if(!x){
			console.log(msg);
			return;
		}
		const params=Twitch.get_params(x[1]);
		let data={
			type	:x[3],
			channel	:x[4],
			user	:x[2]?x[2].split("!")[0]:"",
			raw_msg	:x[5],
			msg		:Twitch.clear_emotes(x[5],params),
			params	:params,
		}
		//console.log(data);
		return data;
	}

	static get_params(l){
		let params=Object.fromEntries(l.substring(1).split(";").map(x=>x.split("=")));
		Twitch.get_badges(params);
		return params;
	}

	static get_badges(params){
		if(params.badges){
			params.badges=params.badges.split(",").map(e=>e.split("/")[0]);
			params.badges.forEach(e=>{
				if(!log_grouplist.includes(e)){
					log_grouplist.push(e);
					Groups.update();
				}
			});
		}
	}

	static clear_emotes(msg,params){
		if(params.emotes){
			let emotes=params.emotes.split("/").reverse().map(x=>x.split(":").map(y=>y.split(",").map(z=>z.split("-"))));
			emotes.forEach(x=>x[1].forEach(y=>{const size=parseInt(y[1])+2-parseInt(y[0]);msg=msg.splice(parseInt(y[0]),size," ".repeat(size))}));
		}
		return msg.replace(/\s{2,}/g," ").trim();
	}

	
}

/*
Twitch.msg("@badge-info=subscriber/14;badges=moderator/1,subscriber/0;client-nonce=ef99b1d9f606cea809c1c4ec2989add4;color=#2E8B57;display-name=Presuntamente;emotes=;first-msg=0;flags=;id=e435cf16-7508-417f-a02e-1bb7fd067872;mod=1;room-id=194927077;subscriber=1;tmi-sent-ts=1638042827616;turbo=0;user-id=488234266;user-type=mod :presuntamente!presuntamente@presuntamente.tmi.twitch.tv PRIVMSG #seyacat :test")
Twitch.msg(":justinfan29530!justinfan29530@justinfan29530.tmi.twitch.tv JOIN #demiontus");
Twitch.msg(":justinfan29530!justinfan29530@justinfan29530.tmi.twitch.tv PART #demiontus");
Twitch.msg(":tmi.twitch.tv HOSTTARGET #demiontus :rhomita 4");
Twitch.msg("@badge-info=subscriber/14;badges=moderator/1,subscriber/0;client-nonce=5423e4bb60671815736a7b42f069fb0f;color=#2E8B57;display-name=Presuntamente;emotes=303422392:33-42/306427250:44-55/307610478:57-65/303662944:7-18,20-31;first-msg=0;flags=;id=28b9e402-2d9c-484b-9a26-156099faf9d1;mod=1;room-id=194927077;subscriber=1;tmi-sent-ts=1638050907354;turbo=0;user-id=488234266;user-type=mod :presuntamente!presuntamente@presuntamente.tmi.twitch.tv PRIVMSG #seyacat :inicio presun9Among presun9Among rafalaTONE pedros27Humo tamayo4XD fin");
Twitch.msg("@emote-only=0;followers-only=-1;r9k=0;rituals=0;room-id=130747120;slow=0;subs-only=0 :tmi.twitch.tv ROOMSTATE #rhomita");
Twitch.msg("@ban-duration=5;room-id=494686511;target-user-id=664042355;tmi-sent-ts=1637699597872 :tmi.twitch.tv CLEARCHAT #s4vitaar :vpabloa");
Twitch.msg("@login=owen20202021;room-id=;target-msg-id=6b9ee65f-e0b2-4d74-b35c-669bf129ebda;tmi-sent-ts=1637762922034 :tmi.twitch.tv CLEARMSG #folagorlives :gran stream");
*/

class TwitchEvents{	//	https://dev.twitch.tv/docs/irc/tags
	static event_list=[
		"JOIN","PART","PRIVMSG","CLEARCHAT","CLEARMSG","HOSTTARGET",
		"highlighted-message","sub","resub","subgift","anonsubgift","submysterygift","giftpaidupgrade","rewardgift","anongiftpaidupgrade","raid","unraid","ritual","bitsbadgetier"
	];
	static events={};
	static ignore=["ROOMSTATE"];

	static start(){
		//Events.add("any",TwitchEvents.input);
	}

	static update(){
		//config -> TwitchEvents.events;
	}

	static input(e){
		Events.dispatch(e.type,e);

		if(e.type==="PRIVMSG" && e.params["custom-reward-id"])
			Events.dispatch("REWARD",e);

/*
		else if(e.params["first-msg"]==="1")
			Events.dispatch("first-msg",e);
		else if(e.params["emote-only"])
			Events.dispatch("emote-only",e);
		else
			Events.dispatch(e.type,e);
*/


		if(TwitchEvents.events[e.type])
			TwitchEvents.events[e.type].forEach(e=>{
				//ejecutar mensaje
			});
		if(e.params["msg-id"] && TwitchEvents.events[e.params["msg-id"]])
			TwitchEvents.events[e.type].forEach(e=>{
				//ejecutar mensaje
			});
		if(!TwitchEvents.ignore.includes(e.type) && (!TwitchEvents.event_list.includes(e.type) || e.params["msg-id"] && !TwitchEvents.event_list.includes(e.params["msg-id"])))
			console.log(e.type,e.params["msg-id"]);
	}
}