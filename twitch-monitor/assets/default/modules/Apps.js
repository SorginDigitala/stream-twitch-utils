class Apps extends Module{
	appContainer;

	static start(){
		data.apps.forEach(app=>config.apps[app.id] && this.load(app));
	}

	static load(app){
		console.log("load:",app,app.id);
		const details=createElement("details",{},this.appContainer);
		const summary=createElement("summary",{classList:"flex"},details);
		createElement("span",{innerText:app.name,classList:"flexgrow"},summary);
		Lang.set_title(createElement("button",{innerText:"X",classList:"button padrevert",onclick:e=>{
			e.preventDefault();
		}},summary),"remove");
		
		if(!config.apps[app.id]){
			config.apps[app.id]=app.defaultOptions;
			ConfigManager.save();
		}
		
		let filecount=0;
		app.files.forEach(f=>{
			filecount++;
			createElement("script",{src:f,onload:()=>{
				--filecount===0 && details.append(apps[app.id].getPanel());
			}},document.body);
		})
	}

	static getPanel(){
		const container=createElement('div',{});
		
		this.appContainer=createElement("div",{},container);

		const form=createElement("form",{classList:"flexinput",onsubmit:e=>{
			e.preventDefault();
			const app=data.apps.find(e=>e.id===select.value);
			if(app && !config.apps[app.id])
				this.load(app)
		}},container);
		const select=createElement("select",{classList:"flexgrow"},form);
		data.apps.forEach(e=>createElement("option",{value:e.id,innerText:e.name,disabled:config.apps[e.id]},select));
		Lang.set_value(createElement("input",{type:"submit",classList:"button"},form),"add");
		
		return container;
	}
}
window.modules.Apps=Apps;