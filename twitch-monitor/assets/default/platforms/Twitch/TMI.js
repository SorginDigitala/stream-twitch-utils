
class TMI{	//	Twitch Messaging Interface
	static ws
	// debería revisar a que canales se conecta para reintentar la conexion cada x tiempo.

	static start(){
		Events.on("Twitch.enable",TMI.enable);
		Events.on("Twitch.channels.update",TMI.on_channels_update);
		TMI.connect();
	}

	static enable(b){
		b?TMI.connect():TMI.disconnect();
	}

	static on_channels_update(leave,join,current){
		if(TMI.ws && TMI.ws.readyState===WebSocket.OPEN){
			leave.forEach(c=>TMI.leave(c));
			join.forEach(c=>TMI.join(c));
		}
	}

	static connect(){	//	https://dev.twitch.tv/docs/irc/guide#connecting-to-twitch-irc
		if(!Twitch.config.enabled)
			return;
		const ws=new WebSocket("wss://irc-ws.chat.twitch.tv/");
		TMI.ws=ws;

		ws.onopen=e=>{
			ws.send("CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands")	// https://dev.twitch.tv/docs/irc/guide
			ws.send("PASS "+(Twitch.user?"oauth:"+sessionStorage.twitchOAuthToken:"SCHMOOPIIE"))
			ws.send("NICK "+(Twitch.user?Twitch.user.login:"justinfan29530"))
			ws.send("USER "+(Twitch.user?Twitch.user.display_name:"justinfan29530")+" 8 * :"+(Twitch.user?Twitch.user.display_name:"justinfan29530"))
			Events.dispatch("TMI.ws",true)
			Twitch.config.channels.forEach(e=>TMI.join(e))
		}

		ws.onclose=e=>{
			if(Twitch.config.enabled)
				setTimeout(TMI.connect,1000)
			Events.dispatch("TMI.ws",false)
		}

		ws.onmessage=e=>{
			const lines=e.data.trim().split(/[\r\n]+/g)
			lines.forEach(l=>{
				if(l.startsWith("PING")){
					ws.send("PONG");
					return;
				}
				//console.log(e.data)
				const x=TMI.process_data(l)
				if(x)
					TMI.process_msg(x,e.data)
			})
		}
		ws.onerror=e=>console.log("[irc-ws.chat] error:",e)
	}

	static disconnect(){
		TMI.ws.close()
	}

	static join(e){TMI.ws.send("JOIN #"+e)}
	static leave(e){TMI.ws.send("PART #"+e)}
	static send(channel,msg){
		if(!Twitch.user)
			return;
		const n=nonce(15)
		TMI.ws.send("@client-nonce="+n+" PRIVMSG #"+channel+" :"+msg)

		const r=new Action("",'Twitch','chat',"msg",channel,n,msg,msg,{id:'@me',username:'@me',color:'#000'});
		Events.dispatch('channel.message',r)
	}



	static pattern=/(.*?):(?:([a-zA-Z0-9_]{3,25}![a-zA-Z0-9_]{3,25}@[a-zA-Z0-9_]{3,25}.tmi.twitch.tv)|tmi.twitch.tv) (JOIN|PART|PRIVMSG|CLEARMSG|CLEARCHAT|HOSTTARGET|NOTICE|USERSTATE|USERNOTICE|ROOMSTATE|GLOBALUSERSTATE)? (?:#([a-zA-Z0-9_]{3,25}))[?:\s:]{0,}(.*?)$/si;

	static process_data(data){
		const x=data.match(TMI.pattern);
		if(!x){
			if(!data.startsWith(":"+(Twitch.user?Twitch.user.login:"justinfan29530")+".tmi.twitch.tv")
			&& !data.startsWith(":tmi.twitch.tv"))
				console.log(data)
			return;
		}
		if(x[5].startsWith("\u0001ACTION "))
			x[5]="/me "+x[5].substring(8)
		
		const params=TMI.get_params(x[1])
		return {
			"type"		:x[3],
			"channel"	:x[4],
			"user"		:x[2]?x[2].split("!")[0]:"",
			"raw_msg"	:x[5],
			"msg"		:TMI.clear_emotes(x[5],params),
			"params"	:params,
		}
	}

	static get_params(l){
		const params=Object.fromEntries(l.substring(1).split(";").map(x=>x.split("=")))
		TMI.get_badges(params)
		return params
	}

	static get_badges(params){
		if(params.badges){
			params.badges=params.badges.split(",").map(e=>e.split("/")[0])
			//params.badges.forEach(e=>Groups.add_to_list(e))
		}
	}

	static clear_emotes(msg,params){
		if(params.emotes){
			const emotes=params.emotes.split("/").reverse().map(x=>x.split(":").map(y=>y.split(",").map(z=>z.split("-"))))
			emotes.forEach(x=>x[1].forEach(y=>{
				const size=parseInt(y[1])+2-parseInt(y[0])
				msg=msg.splice(parseInt(y[0]),size," ".repeat(size))
			}))
		}
		return msg.replace(/\s{2,}/g," ").trim()
	}


	static process_msg(e,original){
		if(e.type==="USERSTATE"){
			const div=document.querySelector("[data-nonce='"+e.params["client-nonce"]+"']")
			if(div){
				delete div.dataset.nonce
				// poner color al usuario
			}
			return;
		}

/*
		const response={
			"platform"	:"twitch",
			"type"		:"",		//	system,		chat,		action,		monetization
			"channel"	:e.channel,
			"id"		:e.params.id??e.params["target-msg-id"],
			"msg"		:e.msg,
			"raw_msg"	:e.raw_msg,
		}
		*/
		const response=new Action(
			original,
			'Twitch',
			'chat',
			'msg',
			e.channel,
			e.params.id??e.params["target-msg-id"],
			e.msg,
			e.raw_msg,
		);

		if(["JOIN","PART","NOTICE"].includes(e.type)){
			["NOTICE"].includes(e.type) && console.log(e);
			if(!["JOIN","PART"].includes(e.type))
				return;
			response.type="system";
			response.subtype=e.type;
			if(Twitch.user && e.user!==Twitch.user.login || !Twitch.user && e.user!=="justinfan29530"){
				Events.dispatch("channel."+(e.type==='JOIN'?'join':'leave'),response)
			}else{
				Events.dispatch('channel.'+(e.type==='JOIN'?'connect':'disconect'),response)
				Events.dispatch('chat.action',response)
			}
			return;
		}

		if(["CLEARCHAT","CLEARMSG",].includes(e.type)){
			response.subtype=e.type
			Events.dispatch("chat."+e.type.toLowerCase(),response)
			return;
		}

		if(e.type==="USERNOTICE" && e.params["msg-id"]==="raid"){
			response.type="system"
			response.subtype="RAID"
			response.msg="from "+e.params["msg-param-displayName"]+" ("+e.params["msg-param-viewerCount"]+")"
			Events.dispatch("chat.action",response)
/*BORRAR*/	if(["loisdefazouro","seyacat"].includes(e.channel))lois_raid(e)	// borrar
			return;
		}

		if(["HOSTTARGET","ROOMSTATE",].includes(e.type))
			return;


		if(["PRIVMSG","USERNOTICE"].includes(e.type)){
			if(e.type==="USERNOTICE")
				console.log(e)
			if(e.params.bits){		//	e.params.bits contiene la cantidad total
				console.log("bits",e)
				response.type="monetization"
			}else{
				response.type="chat"
			}
			response.sender={"id":e.params.id,"username":e.user,"color":e.params.color}
			delete response.subtype
			Events.dispatch("channel.message",response)
			return;

			/*
			if(isMsg){//esto debería ir en EventSystem
				if(config.mode==="tts" && xor_msg(e.params,config.tts))
					TTS.speak_msg(e.user,e.msg)
				else if(config.mode==="alerts" && xor_msg(e.params,config.alerts))
					Alerts.audio_alert.play()
			}
			*/
		}

		console.log(e.type,e)	// Por alguna razón no se está procesando este mensaje.
	}
}