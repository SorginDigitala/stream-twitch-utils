class PlatformManager{

	static start(){
		data.platforms.forEach(p=>{
			config.platforms[p.id]?.load && this.load(p);
		})
	}

	static load(p){
		if(!config.platforms[p.id])
			config.platforms[p.id]=p.defaultOptions;

		if(p.files.length===0){
			this.onload(p);
			return;
		}

		let i=p.files.length;
		p.files.forEach(f=>{
			createElement('script',{src:f,onload:()=>{
				--i===0 && this.onload(p);
			}},document.body);
		})
	}

	static onload(p){
		platforms[p.id].start(p,config.platforms[p.id]);
		Events.dispatch('platform.add',p);
	}

	static remove(p){
		config.platforms[p.id].load=false;
		platforms[p.id].onremove();
		Events.dispatch('platform.remove',p);
	}
}