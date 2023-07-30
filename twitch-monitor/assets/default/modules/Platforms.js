class Platforms extends Module{
	static name='Platforms';

	static start(){
		Events.on('platform.add',Platforms.onAdd);
		Events.on('platform.remove',Platforms.onRemove);
		data.platforms.forEach(p=>Platforms.addButton(p));
	}

	static onAdd(p,click=false){
		if(click)
			document.querySelector('[data-module="'+Platforms.name+'"] [data-name="'+p.id+'"]').click();
	}

	static add(data,container,isOn){
		const div=document.querySelector('[data-module="'+Platforms.name+'"]');
		const menu=div.querySelector('.menu');
		const content=div.querySelector('.content');

		const x=createElement('button',{className:'button'},menu)
		createElement('img',{src:data.logo},x);
		createElement('span',{innerText:data.name},x)
		multimenu_click(div.querySelector('.multimenu'),e=>{
			if(e.dataset.name){
				config.modules.Platforms.default=e.dataset.name;
				ConfigManager.save();
			}
		});
		x.dataset.name=data.name;

		const controls=createElement('div',{style:'height:30px;display:flex;background:rgba(.9,.9,.9,.05);margin:5px 0'});
		container.prepend(controls);

		const label=createElement('label',{style:'height:30px;flex-grow:1'},controls);
		createElement('input',{type:'checkbox',style:'line-height:30px;',checked:isOn,onclick:e=>platforms[data.id].enable(e.target.checked)},label);
		Lang.set_text(createElement('span',{style:'line-height:30px;'},label),'enabled');

		Lang.set_title(createElement('button',{innerText:'X',className:'button',onclick:e=>
		div.querySelector('.content .platformlist input[data-platform="'+data.id+'"]').click()},controls),"remove");

		container.dataset.name=data.name;
		div.querySelector('.content').append(container);

		const el=menu.querySelector('[data-name="'+data.id+'"]');
		if(el)
			el.click();
		else
			menu.querySelector('button:first-child').click();
		
	}

	static onRemove(p){
		const div=document.querySelector('[data-module="'+Platforms.name+'"]')
		div.querySelector('.menu [data-name="'+p.id+'"]').remove();
		div.querySelector('.content [data-name="'+p.id+'"]').remove();
		div.querySelector('.menu>button').click();
	}

	static addButton(p){
		const c=document.querySelector("[data-module="+Platforms.name+"] .platformlist");
		const label=createElement("label",{style:'display:block;'},c);
		const input=createElement("input",{
			type:'checkbox',
			checked:config.platforms[p.id]?.load,
			onclick:e=>{
				if(e.target.checked){
					if(!config.platforms[p.id])
						config.platforms[p.id]=p.defaultOptions;
					config.platforms[p.id].load=true;
					PlatformManager.load(p,true);
				}else
					PlatformManager.rmv(p);
			}
		},label);
		input.dataset.platform=p.id;
		const span=createElement('span',{innerText:p.name},label);
		c.append(label);
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