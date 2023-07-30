class PlatformManager{

	static start(){
		data.platforms.forEach(p=>{
			config.platforms[p.id]?.load && this.load(p);
		})
	}

	static load(p){
		let filecount=0;
		if(platforms[p.id] || data.platforms[p.id]?.files.length===0){
			this.add(p);
			return;
		}
		p.files.forEach(f=>{
			filecount++;
			createElement('script',{src:f,onload:()=>{
				--filecount===0 && this.add(p);
			}},document.body);
		})
	}

	static add(p){
		config.platforms[p.id].load=true;
/*
		mPlatforms.forEach(e=>{
			if(!config.platforms[e.name])
				config.platforms[e.name]=e.defaultOptions;
		});
		*/
		platforms[p.id].start(p,config.platforms[p.id]);
		Events.dispatch('platform.add',p);
	}

	static rmv(p){
		config.platforms[p.id].load=false;
		platforms[p.id].remove();
		Events.dispatch('platform.remove',p);
		ConfigManager.save();
	}
}