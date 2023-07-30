class Alerts extends Module{
	static audio_alert;

	static start(){
		this.enable(config.modules.Alerts.enabled);
	}

	static remove(){
		this.enable(false);
	}

	static enable(b){
		Events[b?"on":"remove"]("channel.message",this.onMsg);
	}

	static onMsg(data){
		const conf=config.modules.Alerts;
		if(
			!conf.enabled
		||	data.platform!=="Twitch"
		||	data.type!=="chat")
			return;
		
		//	comprobar grupos y excepciones
			//return;
		
		if(conf.mode===0)
			Alerts.play();
		//	else
			//tts()
	}


	static getPanel(){
		this.update();

		const conf=config.modules.Alerts;
		const container=createElement('div',{});
		
		//	Volume
		const lvolume=createElement("label",{classList:"flexinput"},container);
		Lang.set_text(createElement("span",{},lvolume),"volume");
		createElement("input",{type:"range",min:0,max:100,value:conf.volume*100,onchange:e=>{
			conf.volume=e.srcElement.value/100;
			Alerts.update();
			ConfigManager.save();
		}},lvolume);

		//	mode
		const lmode=createElement("label",{classList:"label"},container);
		Lang.set_text(createElement("h2",{},lmode)	,"alerts.mode.title");
		Lang.set_text(createElement("p",{},lmode)	,"alerts.mode.desc");
		const mode=createElement("select",{onchange:e=>{
			conf.mode=parseInt(mode.value);
			sounds_config.classList.toggle("hide",conf.mode===1);
			tts_config.classList.toggle("hide",conf.mode===0);
			ConfigManager.save();
		}},lmode);
		createElement("option",{innerText:"Sound",value:0},mode);
		createElement("option",{innerText:"TTS",value:1},mode);
		mode.value=conf.mode;
		//	HTMLHelper.label("alerts.mode.title","alerts.mode.desc",mode,container);
		

		const tts_config=createElement("div",{classList:conf.mode===0?"hide":""},container);
		//	TTS:
			//	default voices
		
		//	url rules
		const url_rules=createElement("select",{onchange:e=>{
			console.log(url_rules.value);
			conf.url_rules=url_rules.value;
			ConfigManager.save();
		}},tts_config);
		createElement("option",{innerText:"Ignore",value:0},url_rules);
		createElement("option",{innerText:"Domain",value:1},url_rules);
		createElement("option",{innerText:"All",value:2},url_rules);
		url_rules.value=conf.url_rules;
		
		const sounds_config=createElement("div",{classList:conf.mode===1?"hide":""},container);
		
		//	sounds
		const lsounds=createElement("div",{classList:"flexinput"},sounds_config);
		createElement("input",{type:"button",value:"🎧",onclick:()=>{this.play()}},lsounds);
		const sounds=createElement("select",{onchange:e=>{
			custom_sound.classList.toggle("hide",sounds.value!=="custom");
			conf.sound=sounds.value;
			Alerts.update();
			Alerts.play();
			ConfigManager.save();
		}},lsounds);
		createElement("option",{innerText:"custom"},sounds);
		//generar lista de sonidos
		createElement("option",{innerText:"beep"},sounds);
		sounds.value=conf.sound;
		
		const custom_sound=createElement("input",{type:"text",classList:conf.sound==="custom"?"":"hide",value:conf.custom,onchange:()=>{
			conf.custom=custom_sound.value.trim();
			this.update();
			this.play();
			ConfigManager.save();
		}},lsounds);

		createElement("hr",{},container);


		const groups=createElement("label",{classList:"label"},container);
		Lang.set_text(createElement("h2",{},groups)	,"Grupos");
		Lang.set_text(createElement("p",{},	groups)	,"Que grupos pueden acceder a esta función.");
		Lang.set_placeholder(createElement("input",{type:"text",onchange:e=>{}},groups),"Déjalo en blanco para permitir a todos los usuarios.");

		const expceptions=createElement("label",{classList:"label"},container);
		Lang.set_text(createElement("h2",{},expceptions)	,"Excepciones");
		Lang.set_text(createElement("p",{},	expceptions)	,"Usuarios a los que incluir o excluir.");
		Lang.set_placeholder(createElement("textarea",{classList:"textarea small",onchange:e=>{}},expceptions),"Nombres de usuario a los que quieras\nactivar/desactivar las alertas.\nLos usuarios en esta lista que NO esten en un grupo activarán la alerta.\nLos usuarios en esta lista que pertenezcan a un grupo activo serán ignorados.");
		//	Groups
		//	exceptions
		
		/*
		<div class="groups">
			<label>
				<h2>Grupos</h2>
				<p>Que grupos pueden acceder a esta función.</p>
				<input id="alerts_groups" type="text" placeholder="Déjalo en blanco para permitir a todos los usuarios.">
			</label>
			<label class="groups_textarea">
				<h2>Excepciones</h2>
				<p>Usuarios a los que incluir o excluir.</p>
				<textarea type="text" id="alerts_exceptions" placeholder="Nombres de usuario a los que quieras activar/desactivar las alertas.
Los usuarios en esta lista que NO esten en un grupo activarán la alerta.
Los usuarios en esta lista que pertenezcan a un grupo activo serán ignorados." style="height: 67px;"></textarea>
			</label>
		</div>
		*/

		//Groups.display_groups(alerts_groups,alerts_exceptions,config.alerts)		
		
		
		return container;
	}

	static update(){
		const conf=config.modules.Alerts;
		this.audio_alert=new Audio(conf.sound==="custom"?conf.custom:"./assets/default/media/sounds/"+conf.sound+".mp3");
		this.audio_alert.volume=conf.volume*config.options.volume;
	}

	static play(){
		this.audio_alert.play();
	}
}
window.modules.Alerts=Alerts;