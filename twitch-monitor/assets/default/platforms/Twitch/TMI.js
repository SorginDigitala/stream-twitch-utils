
class TMI{	//	Twitch Messaging Interface
	static ws
	// debería revisar a que canales se conecta para reintentar la conexion cada x tiempo.

	static start(){
		Events.on("Twitch.enable",TMI.enable);
		Events.on("channels.update",TMI.on_channels_update);
		TMI.connect();
	}

	static enable(b){
		b?TMI.connect():TMI.disconnect();
	}

	static on_channels_update(platform,current,leave,join){
		if(platform!=="Twitch")
			return;
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

		const r=new Action("",'Twitch','chat',"",channel,n,msg,msg,msg,{id:'@me',username:'@me',color:'#000'});
		Events.dispatch('channel.message',r)
	}



	static process_data(data){
		const x=data.match(/(.*?):(?:([a-zA-Z0-9_]{3,25}![a-zA-Z0-9_]{3,25}@[a-zA-Z0-9_]{3,25}.tmi.twitch.tv)|tmi.twitch.tv) ([A-Z]{2,20})? (?:#([a-zA-Z0-9_]{3,25}))[?:\s:]{0,}(.*?)$/si);
		if(!x){
			//console.log("unknown message: ",data)
			return;
		}
		if(x[5].startsWith("\u0001ACTION "))
			x[5]="/me "+x[5].substring(8)
		
		const params=TMI.get_params(x[1])
		return {
			"type"		:x[3],
			"channel"	:x[4],
			"user"		:x[2]?x[2].split("!")[0]:"",
			"msg"		:TMI.format_msg(x[5],params),
			"raw_msg"	:x[5],
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

	static format_msg(msg,params){
		if(params.emotes){
			let emotes=[];
			params.emotes.split("/").map(x=>x.split(":").map(y=>y.split(",").map(z=>z.split("-")))).forEach(x=>{
				x[1].forEach(e=>{
					emotes.push([x[0][0][0],parseInt(e[0]),parseInt(e[1])]);
				});
			});
			emotes.sort((a,b)=>a[1]<b[1]).forEach(x=>{
				msg=msg.splice(
					x[1],
					x[2]+2-x[1],
					"<img class=\"emote\" src=\"https://static-cdn.jtvnw.net/emoticons/v2/"+x[0]+"/default/light/1.0\">"
				);
			})
		}

		if(Twitch.user?.login==="seyacat" & msg.includes("*quack*")){
			quacks[Math.floor(Math.random()*(1-5)+5)].play();
			msg=msg.replace("*quack*"," ")
		}
		return msg.replace(/\s{2,}/g," ").trim()
	}


	static process_msg(e,original){
		if(e.type==="USERSTATE"){
			/*
			Confirmación de que la acción se ha recibido.
			Si contiene e.params["client-nonce"] significa que contiene un mensaje.
			En caso contrario, puede ser una acción como la conexión a un canal
			console.log(e);
			const div=document.querySelector("[data-nonce='"+e.params["client-nonce"]+"']")
			if(div){
				delete div.dataset.nonce
				// poner color al usuario
			}
			*/
			return;
		}

		if(e.type==="ROOMSTATE"){
			return;
		}

		const response=new Action(
			original,
			'Twitch',
			'chat',
			'msg',
			e.channel,
			e.params.id??e.params["target-msg-id"],
			e.msg,
			e.raw_msg,
			e.params["emote-only"]==="1"
		);


		if(["PRIVMSG","USERNOTICE"].includes(e.type)){
			if(e.type==="USERNOTICE"){
				console.log(e)
			}
			if(e.params.bits){		//	e.params.bits contiene la cantidad total
				console.log("bits",e);
				response.type="monetization";
			}else if(e.params["msg-id"]==="raid"){
				response.type="action";
				response.subtype="RAID";
				response.msg="from "+e.params["msg-param-displayName"]+" ("+e.params["msg-param-viewerCount"]+")";
				Events.dispatch("chat.action",response)
				return;
			}else{
				response.type="chat"
			}
			response.sender=new User(e.params.id,e.user,e.params["display-name"],e.params.color);
			delete response.subtype;
			Events.dispatch("channel.message",response)
			return;
		}

		if(["JOIN","PART"].includes(e.type)){
			response.type="system";
			response.subtype=e.type;
			if(Twitch.user && e.user!==Twitch.user.login || !Twitch.user && e.user!=="justinfan29530"){
				//	response.sender=new User(e.user,e.user,e.user);
				//	Events.dispatch('chat.action',response)
			}else{
				Events.dispatch('chat.action',response)
			}
			return;
		}

		if(["CLEARCHAT","CLEARMSG",].includes(e.type)){
			response.subtype=e.type
			Events.dispatch("chat."+e.type.toLowerCase(),response)
			return;
		}

		console.log(e.type,e,original)	// Por alguna razón no se está procesando este mensaje.
	}
}