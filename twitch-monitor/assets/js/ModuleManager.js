class ModuleManager{

	static start(){
		//	Cargamos módulos obligatorios.
		this.load(data.modules.find(x=>x.id==="Platforms"),1);
		this.load(data.modules.find(x=>x.id==="Config"),2);
		
		//	Cargamos el resto de módulos
		config.mymodules.forEach((list,i)=>{
			list.forEach(m=>this.load(data.modules.find(x=>x.id===m),i+1));
		});
		
		//	código antiguo:
		//StreamList.start(config.platforms.Twitch.channels,config.platforms.Youtube.channels)
		//SEvents.start();
		//Commands.start();
		//Timers.start();
	}

	static load(module,column=0){
		if(column===0)
			column=this.getSmallerColumn();
		const col=panelgrid.querySelector('.column:nth-child('+(column)+')');

		const fieldset=createElement('fieldset',{});
		fieldset.dataset.module=module.id;
		createElement('legend',{innerText:module.name},fieldset);
		col.append(fieldset);
		
		let filecount=0;
		module.files.forEach(f=>{
			filecount++;
			createElement("script",{src:f,onload:()=>{
				--filecount===0 && this.add(module);
			}},document.body);
		})
	}

	static manageBar(module,container){
		const isOn=config.modules[module.id]?.enabled;
		
		const controls=createElement('div',{style:'height:30px;display:flex;background:rgba(.9,.9,.9,.05);margin:5px 0'},container);

		const label=createElement('label',{style:'height:30px;flex-grow:1'},controls);
		createElement('input',{type:'checkbox',style:'line-height:30px;',checked:isOn,onclick:e=>{
			const b=e.target.checked;
			config.modules.Alerts.enabled=b;
			modules[module.id].enable(b);
			ConfigManager.save();
		}},label);
		Lang.set_text(createElement('span',{style:'line-height:30px;'},label),'enabled');

		Lang.set_title(createElement('button',{innerText:'X',className:'button',onclick:e=>{
			ModuleManager.rmv(module.id);
			ConfigManager.save();
		}},controls),"remove");
	}

	static getSmallerColumn(){
		const columns=panelgrid.querySelectorAll('.column');
		return columns[0].offsetHeight>columns[1].offsetHeight?2:1;
	}

	static add(module){
		const id=module.id;
		const m=modules[id];
		
		if(!config.modules[id]){
			const m2=data.modules.find(e=>e.id===id);
			console.log(m2);
			config.modules[id]=m2.defaultOptions;
		}

		const fieldset=document.querySelector("[data-module="+id+"]");

		if(module.managebar)
			this.manageBar(module,fieldset);
		
		fieldset.append(m.getPanel());
		m.start();
	}

	static rmv(id){
		modules[id].remove();
		document.querySelector("[data-module="+id+"]").remove();
		
		config.mymodules[0]=config.mymodules[0].filter(e=>e!==id);
		config.mymodules[1]=config.mymodules[1].filter(e=>e!==id);
	}
}