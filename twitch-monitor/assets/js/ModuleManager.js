class ModuleManager{

	static start(){
		//	Cargamos módulos obligatorios.
		this.load(data.modules.find(x=>x.id==="Platforms"),1);
		this.load(data.modules.find(x=>x.id==="Config"),2);
		
		//	Cargamos el resto de módulos
		config.mymodules.forEach((list,i)=>{
			list.forEach(m=>this.load(data.modules.find(x=>x.id===m),i+1));
		});
	}

	static load(module,column=0){
		//	Si no tiene columna, se le asigna una.
		if(column===0)
			column=this.getSmallerColumn();
		const col=panelgrid.querySelector('.column:nth-child('+(column)+')');

		//	Se genera el html (se crea antes para que mantenga el orden)
		const fieldset=createElement("fieldset",{},col);
		fieldset.dataset.module=module.id;
		Lang.set_text(createElement("legend",{},fieldset),"module."+module.id);

		//	Se cargan los scripts y una vez cargados se llama a la función this.onload();
		ConfigManager.loadScripts(module.files,()=>{
			this.onload(module,fieldset)
		});
	}

	static getSmallerColumn(){
		const columns=panelgrid.querySelectorAll('.column');
		return columns[0].offsetHeight>columns[1].offsetHeight?2:1;
	}

	static onload(data,fieldset){
		const id=data.id;
		const m=modules[id];
		
		//	Si no existe una configuración guardada, se carga una por defecto.
		if(!config.modules[id])
			config.modules[id]=data.defaultOptions;

		//	Si el módulo tiene una barra de opciones, la cargamos
		if(data.managebar)
			fieldset.append(this.manageBar(data));
		
		fieldset.append(m.getPanel());
		m.start();
	}

	static remove(id){
		//	Avisamos al módulo de que se debe borrar.
		modules[id].onremove();

		//	Eliminamos el html del módulo
		document.querySelector("[data-module="+id+"]").remove();
		
		//	Lo eliminamos de la configuración del usuario
		const m=config.mymodules;
		m[0]=m[0].filter(e=>e!==id);
		m[1]=m[1].filter(e=>e!==id);
	}

	static manageBar(data){
		const conf=config.modules[data.id];
		const isOn=conf.enabled;
		
		const container=createElement("div",{classList:"manageBar"});

		const label=createElement("label",{},container);
		createElement("input",{type:"checkbox",checked:isOn,onclick:e=>{
			const b=e.target.checked;
			conf.enabled=b;
			modules[data.id].enable(b);
			ConfigManager.save();
		}},label);
		Lang.set_text(createElement("span",{},label),"enabled");

		Lang.set_title(createElement("button",{innerText:"X",className:"button",onclick:e=>{
			ModuleManager.remove(data.id);
			ConfigManager.save();
		}},container),"remove");
		return container;
	}
}