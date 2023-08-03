class Twitch extends Platform{
	static user;
	static config;
	static data;

	static start(data){
		this.data=data;
		if(config.platforms.Twitch){
			this.config=config.platforms.Twitch;
		}else
			config.platforms.Twitch=this.config=data.defaultOptions;

		Events.on("Twitch.login",		this.on_login);
		Events.on("on.platform.login",	this.on_login);

		TwitchAPI.login();
		TwitchBuilder.start();
	}

	static enable(b){
		TwitchBuilder.check_enable(b);
		Events.dispatch("on.platform.enable",this.data,b);
	}

	static remove(){
		//borrar Platform
		console.log("remove twitch platform")
	}

	static logout(){
		sessionStorage.clear();
		location.reload();
		/*
		TMI.enable(false);
		PubSub.enable(false);
		TwitchBuilder.update_auth_html(false);
		*/
	}






	static on_login(b){
		TMI.start()
		if(b)
			PubSub.start();
	}


	static getPanel(){
		
	}





	//	chat admin
	static ban(channel,username,time=0){
		//	https://dev.twitch.tv/docs/api/reference/#ban-user
		console.error(this.name+".ban(channel,username,time=0)",channel,username,time);
	}

	static unban(channel,username){
		//	https://dev.twitch.tv/docs/api/reference/#unban-user
		console.error(this.name+".unban(channel,username)",channel,username);
	}
}
window.platforms['Twitch']=Twitch;