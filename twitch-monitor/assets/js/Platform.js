class Platform{


	//	
	static start(data){
		Platforms.add(data,createElement('div',{innerText:'Comming soon...'}));
		console.error(this.name+".start()",data);
	}

	static enable(b){
		console.error(this.name+".enable(b)",b);
	}

	static remove(){
		console.error(this.name+".remove()");
	}

	static login(){
		console.error(this.name+".login()");
	}

	static logout(){
		console.error(this.name+".logout()");
	}

	static getPanel(){
		// throw para evitar que se genere un panel
		throw new Error(this.name+".getPanel()");
	}


	//	channel manage
	static join(channel){
		console.error(this.name+".join(channel)",channel);
	}

	static leave(channel){
		console.error(this.name+".leave(channel)",channel);
	}


	//	chat actions
	static msg(channel,msg){
		console.error(this.name+".msg(channel,msg)",channel,msg);
	}

	static action(channel,action){
		console.error(this.name+".action(channel,action)",channel,action);
	}


	//	chat admin
	static ban(channel,username,time=0){
		console.error(this.name+".ban(channel,username,time=0)",channel,username,time);
	}

	static unban(channel,username){
		console.error(this.name+".unban(channel,username)",channel,username);
	}

	static set_roles(channel,username,roles){
		console.error(this.name+".set_roles(channel,username,roles)",channel,username,roles);
	}
}