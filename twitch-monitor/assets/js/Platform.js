class Platform{


	//	
	static start(data){
		let html="Estás intentando cargar una plataforma ("+this.name+") que no contiene el método start()."
		+"<br>Se ha cargado el método Platform.start()."
		+"<br><a href=\""+currentScriptPath(1)+"/Platform.js\" target=_blank>Platform.js</a>";
		window.data.platforms.find(e=>e.id===this.name).files.forEach(e=>{
			html+="<br><a href=\""+e+"\" target=_blank>"+e.split("/").slice(-1)+"</a>";
		});
		Platforms.add(data,createElement('div',{innerHTML:html}));
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
		const container=createElement("div",{innerHTML:"aoeu"});
		return container;
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

	static setRoles(channel,username,roles){
		console.error(this.name+".setRoles(channel,username,roles)",channel,username,roles);
	}


	//	Obtener info
	static getChannels(){
		console.error(this.name+".getChannels()");
		return [];
	}
}