class Config extends Module{
	static name='Config';

	static start(){
	}
	static save(){
		console.error("Config.save() -> ConfigManager.save()");
	}

	static getPanel(){
		const container=createElement('div');
		
		//lang
		const lang_selector=createElement('div',{className:'flex'});
		Lang.langs.forEach(l=>{
			const d=createElement('div',{title:l.title,innerText:l.icon,onclick:x=>{
				config.options.lang=l.id;
				Lang.load(l.id);
			ConfigManager.save();
			}},lang_selector);
			d.dataset.lang	=l.id;
		});
		container.append(lang_selector);
		
		//volume
		const volume=createElement('label',{},container);
		const v=createElement('span',{},volume);
		Lang.set_text(v,"options.volume");
		createElement('input',{
			value:config.options.volume*100,
			type:'range',
			min:0,
			max:100,
			onchange:e=>{
				config.options.volume=e.target.value/100;
				//Alerts.set_volume();
				//Media.set_volume();
				ConfigManager.save();
			}
		},volume);
		
		
		/*
				<details>
					<summary>Text to Speech</summary>
					<label><span data-lang_text=tts.volume>Volumen</span>: <input id=tts_volume type=range min=0 max=100></label>
					<div>
						<div>Filtro de voz por defecto</div>
						<input type=text id=defaultVoice placeholder="spanish">
						<div>Filtro de voces para usuarios por defecto (Cuando se use la acción "tts_message")</div>
						<input type=text id=defaultVoices placeholder="spanish">
					</div>

					<div>
						<span data-lang_text=options.speech_url_rules>Speech url rules</span>:
						<select id=speech_urls>
							<option value=0 data-lang_text=options.speech_rule_ignore>Ignore</option>
							<option value=1 data-lang_text=options.speech_rule_domain>Domain</option>
							<option value=2 data-lang_text=options.speech_rule_full>Full</option>
						</select>
					</div>
				</details>
				
				<div class=flexinput>
					<input id=config_export type=button value="Export" data-lang_value=options.export>
					<input id=config_import type=button value="Import" data-lang_value=options.import>
					<input id=clear_config type=button value="Reset Config" data-lang_value=options.reset data-lang_title=options.reset_title>
				</div>
				*/
		
		const exports=createElement('div',{className:'flexinput'},container);
		createElement('input',{type:'button',className:'button',value:'Import',onclick:e=>{}},exports);
		createElement('input',{type:'button',className:'button',value:'Export',onclick:e=>{}},exports);
		createElement('input',{type:'button',className:'button',value:'Reset',onclick:e=>{ConfigManager.clear()}},exports);
		
		//credits
		createElement('p',{innerHTML:'<a href="./" target=_blank data-lang_text=credits_home>Home</a> - <a href="./docs.html" target=_blank data-lang_text=credits_docs>Docs</a> - <a href="https://github.com/SorginDigitala/stream-twitch-utils" target=_blank>Github</a>. Por <a href="https://www.twitch.tv/seyacat" target=_blank>Seyacat</a> y <a href="https://www.twitch.tv/presuntamente" target=_blank>Presuntamente</a>.'},container);
				
		return container;
	}
}
window.modules.Config=Config;