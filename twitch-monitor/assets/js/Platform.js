class Platform{

	//	
	static start(data){
		console.error(this.name+".start()",data);
	}

	static enable(b){
		console.error(this.name+".enable(b)",b);
	}

	static onremove(){
		console.error(this.name+".onremove()");
	}

	static logout(){
		console.error(this.name+".logout()","Se requiere para cuando se fuerza el borrado de datos");
		throw new Error(this.name+".logout()");
	}


	static getPanel(){
		console.error(this.name+".getPanel()");
		let html="Estás intentando cargar una plataforma ("+this.name+") que no contiene el método getPanel()."
		+"<br>Se ha cargado el método Platform.start()."
		+"<br><a href=\""+currentScriptPath(1)+"/Platform.js\" target=_blank>Platform.js</a>";
		window.data.platforms.find(e=>e.id===this.name).files.forEach(e=>{
			html+="<br><a href=\""+e+"\" target=_blank>"+e.split("/").slice(-1)+"</a>";
		});
		const container=createElement("div",{innerHTML:html});
		return container;
	}


	//	Obtener info
	static getChannels(){
		console.error(this.name+".getChannels()");
		return [];
	}


	//	chat actions
	static send(channels,msg){
		console.error(this.name+".send(channels,msg)",channels,msg);
	}

	static action(channel,action){
		console.error(this.name+".action(channel,action)",channel,action);
	}


	//	channel manage
	static join(channel){
		console.error(this.name+".join(channel)",channel);
	}

	static leave(channel){
		console.error(this.name+".leave(channel)",channel);
	}

	static ban(channel,username,time=0){
		console.error(this.name+".ban(channel,username,time=0)",channel,username,time);
	}

	static unban(channel,username){
		console.error(this.name+".unban(channel,username)",channel,username);
	}

	static setRoles(channel,username,roles){
		console.error(this.name+".setRoles(channel,username,roles)",channel,username,roles);
	}
}