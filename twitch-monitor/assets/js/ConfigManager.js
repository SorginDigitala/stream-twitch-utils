"use strict";

class ConfigManager{
	static async load(){
		//	Obtenemos la configuración de usuario
		const x=localStorage.getItem("chat-config");
		config=x?JSON.parse(x):(await fetch("./assets/config.json",{cache:"force-cache"}).then(r=>r.json()).then(r=>r));
		
		console.log(config.options.lang);
		//	Cargamos el idioma (lo hacemos aquí para que sea asincrono mientras se cargan el resto de datos)
		Lang.start(config.options.lang);

		//	Obtenemos los datos de configuración de las apps por defecto y customizadas
		const scripts=[...["./assets/default/data.json"],...config.options.scripts];
		for(let x of scripts)
			await this.getConfigData(x);

		//	Ordenamos los módulos/plataformas/... alfabeticamente
		[data.platforms,data.modules,data.media].forEach(e=>e.sort((a,b)=>a.name.localeCompare(b.name)));
	}

	static async getConfigData(url){
		const x=await fetch(url,{cache:"force-cache"}).then(r=>r.json()).then(r=>r).catch(e=>console.error("data file:",e));
		if(!x)
			return;
		Object.keys(x).forEach(k=>{
			if(!data[k])
				data[k]=x[k];
			else
				data[k]=[...data[k],...x[k]];
		});
	}

	static save(){
		localStorage.setItem("chat-config",JSON.stringify(config));
		console.warn("save");
	}

	static clear(){
		localStorage.clear();
		location="";
	}
}