class Platforms extends Module{

	static start(){
		data.platforms.forEach(p=>{
			Platforms.addButton(p);
			platforms[p.id] && config.platforms[p.id]?.load && this.onLoad(p);
		});

		Events.on("on.platform.add",Platforms.onLoad);
		Events.on("on.platform.remove",Platforms.onRemove);
	}

	static onLoad(data){
		const conf=config.platforms[data.id];
		const div=document.querySelector('[data-module="'+Platforms.name+'"]');
		const menu=div.querySelector('.menu');
		const content=div.querySelector('.content');

		const container=createElement("div",{},content);
		container.dataset.name=data.id;

		//	Se crea el botón del menú
		const x=createElement('button',{className:'button'},menu)
		createElement('img',{src:data.logo},x);
		createElement('span',{innerText:data.name},x)
		multimenu_click(div.querySelector('.multimenu'),(e,save)=>{
			if(e.dataset.name){
				config.modules.Platforms.default=e.dataset.name;
				if(save)
					ConfigManager.save();
			}
		});
		x.dataset.name=data.id;
		
		//	Se crea el botón del menú
		const controls=createElement('div',{classList:"manageBar"},container);

		const label=createElement('label',{},controls);
		createElement('input',{type:'checkbox',checked:conf.enabled,onclick:e=>{
			platforms[data.id].enable(e.target.checked);
			ConfigManager.save();
		}},label);
		Lang.set_text(createElement('span',{style:'line-height:30px;'},label),'enabled');

		Lang.set_title(createElement('button',{innerText:'X',className:'button',onclick:e=>{
			PlatformManager.remove(data);
			ConfigManager.save();
		}},controls),"remove");

		//	Se obtiene el panel de la plataforma.
		const panel=platforms[data.id].getPanel();
		container.append(panel);

		//	Simula un clic sobre el botón del menú
		const el=menu.querySelector('[data-name="'+data.id+'"]');
		el.onclick();
	}

	static addButton(p){
		const c=document.querySelector("[data-module="+Platforms.name+"] .platformlist");
		const label=createElement("label",{style:'display:block;'},c);
		const input=createElement("input",{
			type:'checkbox',
			checked:config.platforms[p.id]?.load,
			onclick:e=>{
				if(e.target.checked){
					PlatformManager.load(p);
				}else
					PlatformManager.remove(p);
				ConfigManager.save();
			}
		},label);
		input.dataset.platform=p.id;
		createElement('span',{innerText:p.name},label);
	}

	static onRemove(p){
		const div=document.querySelector('[data-module="'+Platforms.name+'"]');
		div.querySelector('.menu [data-name="'+p.id+'"]').remove();
		div.querySelector('.content [data-name="'+p.id+'"]').remove();
		div.querySelector('.platformlist input[data-platform="'+p.id+'"]').checked=false;
		div.querySelector('.menu>button').click();
	}



	static getPanel(){
		const container=createElement('div',{className:'multimenu'});
		const m=createElement('div',{className:'menu'},container);
		createElement('button',{className:'button',innerText:'+'},m);
		const c=createElement('div',{className:'content'},container);
		createElement('div',{className:'platformlist'},c);
		return container;
	}
}
window.modules.Platforms=Platforms;