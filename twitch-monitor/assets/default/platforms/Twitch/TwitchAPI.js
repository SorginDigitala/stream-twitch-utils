class TwitchAPI{
	static url;

	static async request(url,method,params={}){
		const options={
			method:method,
			headers:{
				"Authorization"	:"Bearer "+sessionStorage.twitchOAuthToken,
				"Client-Id"		:Twitch.config.clientId,
				"Content-Type"	:"application/json"
			}
		};
		if(method==="POST" && params)
			options.headers.body=JSON.stringify(params);
	console.log(options);
		const r=await fetch(url,options);
		return(await r.json()).data;
	}

	static get(url){
		return this.request(url,"GET");
	}

	static post(url,params){
		console.log("test: ----> ",url,params);
		return this.request(url,"POST",params);
	}

	static delete(url){
		return this.request(url,"POST");
	}

	static get_users(users){		//	https://dev.twitch.tv/docs/api/reference#get-users
		return TwitchAPI.get("https://api.twitch.tv/helix/users?login="+users.join("&login="))
	}

	static get_streams(users){		//	https://dev.twitch.tv/docs/api/reference#get-streams
		return TwitchAPI.get("https://api.twitch.tv/helix/streams?user_login="+(users.join("&user_login=")))
	}

	static get_last_followers(){	//	https://dev.twitch.tv/docs/api/reference#get-users-follows
		return TwitchAPI.get('https://api.twitch.tv/helix/users/follows?first=30&to_id='+Twitch.user.id)
	}

	static ban(channel,user){	//	https://dev.twitch.tv/docs/api/reference/#ban-user
		this.post(
			"https://api.twitch.tv/helix/moderation/bans?broadcaster_id="+Twitch.user.id+"&moderator_id="+Twitch.user.id,
			{data:{user_id:user.id,duration:300,reason:"no reason"}}
		);
	}

	static update_channels(str){
		let oldchannels=channels_to_array(str)
		if(oldchannels.length===0){
			Twitch.config.channels=[]
			Events.dispatch("Twitch.channels.update",Twitch.config.channels,[],[])
			return
		}
		TwitchAPI.get_users(oldchannels).then(data=>{
			const channels=data.map(e=>e.login)
			const leave=Twitch.config.channels.filter(c=>!channels.includes(c));
			const join=channels.filter(c=>!Twitch.config.channels.includes(c));
			Twitch.config.channels=oldchannels.filter(e=>channels.includes(e));
			Events.dispatch("Twitch.channels.update",leave,join,Twitch.config.channels)
		})
	}

	static check_last_follows(){
		TwitchAPI.get_last_followers().then(users=>{
			//	habría que guardar el último o ultimos seguidores + fecha para evitar que de follow + unfollow y salte multiples veces el penultimo
			console.log("follows",users)
		})
	}

	static login(){	//	https://dev.twitch.tv/docs/authentication/getting-tokens-oauth
		const hash=location.hash;
		location.hash="";
		if(hash.match(/access_token=(\w+)/))
			TwitchAPI.parseFragment(hash)
		if(sessionStorage.twitchOAuthToken){
			TwitchAPI.get("https://api.twitch.tv/helix/users").then(users=>{
				Twitch.user=users[0];
				delete Twitch.user.email	// borramos datos personales por seguridad
				//setInterval(Twitch.check_last_follows,5000)
				Events.dispatch("Twitch.login",true);
			})
		}else{
			TwitchAPI.authUrl();
			Events.dispatch("Twitch.login",false);
		}
	}

	static hashMatch(hash,expr){
		const match=hash.match(expr)
		return match?match[1]:null;
	}

	static parseFragment(hash) {
		const state=TwitchAPI.hashMatch(hash,/state=(\w+)/)
		if(sessionStorage.twitchOAuthState===state)
			sessionStorage.twitchOAuthToken=TwitchAPI.hashMatch(hash,/access_token=(\w+)/)
	}

	static authUrl(scope=[
		"moderator:manage:banned_users",
		"chat:read",
		"chat:edit",
		"channel:read:subscriptions",
		"channel:manage:redemptions"
	]){
		sessionStorage.twitchOAuthState=nonce(15)
		TwitchAPI.url='https://id.twitch.tv/oauth2/authorize?response_type=token&client_id='+Twitch.config.clientId+'&redirect_uri='+(location.origin+location.pathname)+'&state='+sessionStorage.twitchOAuthState+'&scope='+scope.join("+");
		return TwitchAPI.url;
	}
}