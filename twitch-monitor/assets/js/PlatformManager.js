class PlatformManager{

	static start(){
		data.platforms.forEach(p=>{
			config.platforms[p.id]?.load && this.load(p);
		})
	}

	static load(p){
		if(!config.platforms[p.id])
			config.platforms[p.id]=p.defaultOptions;
		config.platforms[p.id].load=true;

		ConfigManager.loadScripts(p.files,()=>{
			this.onload(p);
		});
	}

	static onload(p){
		platforms[p.id].start(p,config.platforms[p.id]);
		Events.dispatch("on.platform.add",p);
	}

	static remove(p){
		config.platforms[p.id].load=false;
		platforms[p.id].onremove();
		Events.dispatch("on.platform.remove",p);
	}



	static getChannels(){
		let ch=[];
		data.platforms.filter(p=>config.platforms[p.id]?.load).forEach(p=>{
			ch.push([p.id,platforms[p.id].getChannels()]);
		});
		return ch;
	}
}