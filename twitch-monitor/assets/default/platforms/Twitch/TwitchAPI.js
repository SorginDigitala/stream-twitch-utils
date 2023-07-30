class TwitchAPI{
	static url;

	static async get(url){
		const r=await fetch(url,{method:"GET",headers:{"Client-ID":Twitch.config.clientId,"Authorization":"Bearer "+sessionStorage.twitchOAuthToken}});
		return(await r.json()).data;
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
		if(location.hash.match(/access_token=(\w+)/))
			TwitchAPI.parseFragment(location.hash)
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
		location.hash=""
	}

	static authUrl(scope="channel:moderate+chat:read+chat:edit+channel:manage:redemptions+user_read+channel:read:subscriptions"){
		sessionStorage.twitchOAuthState=nonce(15)
		TwitchAPI.url='https://id.twitch.tv/oauth2/authorize?response_type=token&client_id='+Twitch.config.clientId+'&redirect_uri='+(location.origin+location.pathname)+'&state='+sessionStorage.twitchOAuthState+'&scope='+scope;
		return TwitchAPI.url;
	}
}