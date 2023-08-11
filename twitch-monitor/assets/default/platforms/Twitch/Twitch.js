class Twitch extends Platform{
	static user;
	static config;
	static data;

	static start(data){
		this.data=data;
		this.config=config.platforms.Twitch;

		Events.on("Twitch.login",this.on_login);

		TwitchAPI.login();
		TwitchBuilder.start();
		TwitchAPI.update_channels(this.config.channels.join(", "));
	}

	static enable(b){
		TwitchBuilder.check_enable(b);
		Events.dispatch("on.platform.enable",this.data,b);
	}

	static onremove(){
		//borrar Platform
	}

	static logout(){
		TwitchAPI.logout();
	}

	static getChannels(){
		return Twitch.config.channels;
	}

	static getPanel(){
		
	}





	static on_login(b){
		TMI.start()
		b && PubSub.start();
	}



	static send(channels,msg){
		channels.forEach(c=>{
			TMI.send(c,msg);
		});
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
platforms.Twitch=Twitch;