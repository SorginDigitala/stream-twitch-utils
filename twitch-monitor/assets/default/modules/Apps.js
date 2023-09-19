class Apps extends Module{
	appContainer;
	select;

	static start(){
		data.apps.forEach(app=>config.apps[app.id]?.enabled && this.load(app));
	}

	static load(app){
		if(!config.apps[app.id])
			config.apps[app.id]=app.defaultOptions;
		const conf=config.apps[app.id];
		conf.enabled=true;

		const details=createElement("details",{},this.appContainer);
		details.dataset.app=app.id;
		const summary=createElement("summary",{classList:"flex"},details);
		createElement("span",{innerText:app.name,classList:"flexgrow"},summary);
		const option=this.select.querySelector("[value="+app.id+"]");
		Lang.set_title(createElement("button",{innerText:"X",classList:"button padrevert",onclick:e=>{
			e.preventDefault();
			this.remove(app);
			conf.enabled=false;
			option.disabled=false;
			ConfigManager.save();
		}},summary),"remove");
		
		option.disabled=true;

		ConfigManager.loadScripts([app.path+app.id+".js"],()=>{
			details.append(apps[app.id].getPanel());
		});
	}

	static remove(app){
		//	desactivar el panel, para que se cierre la pestaña
		//	elminar html
		document.querySelector("[data-module="+this.name+"] details[data-app="+app.id+"]").remove();
	}

	static getPanel(){
		const container=createElement('div',{});
		createElement("p",{innerText:"Las aplicaciones blah blah blah..."},container);
		
		this.appContainer=createElement("div",{},container);

		const form=createElement("form",{classList:"flexinput",onsubmit:e=>{
			e.preventDefault();
			const app=data.apps.find(e=>e.id===this.select.value);
			if(app && !config.apps[app.id]?.enabled){
				this.load(app);
				ConfigManager.save();
			}
		}},container);
		this.select=createElement("select",{classList:"flexgrow"},form);
		data.apps.forEach(e=>createElement("option",{value:e.id,innerText:e.name,disabled:config.apps[e.id]?.enabled},this.select));
		Lang.set_value(createElement("input",{type:"submit",classList:"button"},form),"add");
		
		return container;
	}
}
window.modules.Apps=Apps;