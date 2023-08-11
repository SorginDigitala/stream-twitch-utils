class PubSub{
	static ws

	static start(){
		Events.on("channels.update",PubSub.on_channels_update)
		Events.on("Twitch.enable",PubSub.enable)
		PubSub.connect()
	}

	static enable(b){
		if(!Twitch.user)
			return;
		b?PubSub.connect():PubSub.ws.close()
	}

	static on_channels_update(platform,currentleave,join){
		//PubSub.send_command("UNLISTEN",leave)
		//PubSub.send_command("LISTEN",join)
	}

	static connect(){	//	https://dev.twitch.tv/docs/pubsub#connection-management
		if(!Twitch.config.enabled)
			return;
		const heartbeatInterval=60000	//ms between PING's
		const reconnectInterval=1000	//ms to wait before reconnect
		var heartbeatHandle

		PubSub.ws=new WebSocket('wss://pubsub-edge.twitch.tv')

		PubSub.ws.onopen=function(e){
			heartbeatHandle=setInterval(e=>PubSub.ws.send('{"type":"PING"}'),heartbeatInterval)
			PubSub.send_command("LISTEN",["channel-points-channel-v1." +Twitch.user.id,"raid."+Twitch.user.id])
			Events.dispatch("PubSub.ws",true)
			Events.on("channels.update",PubSub.on_channels_update)
		}

		PubSub.ws.onmessage=function(event){
			const message=JSON.parse(event.data)
			if(message.type==="RECONNECT")
				setTimeout(PubSub.connect,reconnectInterval)
		}

		PubSub.ws.onclose=function(){
			clearInterval(heartbeatHandle)
			if(Twitch.config.enabled)
				setTimeout(PubSub.connect,reconnectInterval)
			Events.dispatch("PubSub.ws",false)
			Events.remove("channels.update",PubSub.on_channels_update)
		}

		PubSub.ws.onerror=e=>console.log("[pubsub-edge] error:",e)
	}

	static listen(ch){
		
	}

	static unlisten(ch){
		
	}

	static send_command(type,topics){//	hay que guardar el nonce y meter a todos los canales posibles
		PubSub.send({
			"type":type,
			"nonce":nonce(15),
			"data":{
				"topics":topics,
				"auth_token":sessionStorage.twitchOAuthToken
			}
		})
	}

	static send(message){
		PubSub.ws.send(JSON.stringify(message))
	}
}