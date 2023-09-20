class Alerts extends Module{
	static audio_alert;

	static start(){
		this.enable(config.modules.Alerts.enabled);
	}

	static enable(b){
		Events[b?"on":"remove"]("channel.message",this.onMsg);
	}

	static onremove(){
		this.enable(false);
	}

	static onMsg(data){
		const conf=config.modules.Alerts;

		if(!conf.enabled || data.type!=="chat")
			return;

		if(data.msg[0]==="!"){
			if(data.msg.startsWith("!voice")){
				const v=data.msg.split(" ");
				TTS.setVoice(
					data.sender.username,
					TTS.getRandVoice(v[1]).voiceURI,
					v[2]?parseFloat(v[2]):1,
					v[3]?parseFloat(v[3]):1
				);
			}
			return;
		}

		//	ig(!comprobar grupos y excepciones)
			//return;
		
		if(conf.mode===0)
			Alerts.play();
		else
			Alerts.tts(data);
	}

	static tts(data){
		const conf=config.modules.Alerts;
		const msg=this.parse_urls(data.msg,conf.url_rules).replace(/(<([^>]+)>)/ig,"").trim();
		if(msg==="" || conf.ignoreNumbers && !/\p{L}/u.test(msg))
			return;
		console.log(msg)
		TTS.speak_msg(data.sender.username,msg,conf.volume*config.options.volume);
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
			this.update();
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
		

		const tts_config=createElement("div",{classList:conf.mode===0?"hide":""},container);
		
		createElement("div",{innerText:"Default voice: "},tts_config);
		const dvoices=createElement("select",{onchange:e=>{
			conf.defaultVoice=dvoices.value;
			TTS.defaultVoice=synth.getVoices().find(v=>v.voiceURI.includes(dvoices.value));
			if(e)
				ConfigManager.save();
		}},tts_config);
		
		synth.onvoiceschanged=()=>{
			TTS.defaultVoices=synth.getVoices().filter(e=>e.name.toLowerCase().includes("spanish"))
			dvoices.innerHTML="";
			synth.getVoices().forEach(async e=>{
				createElement("option",{innerText:e.name,value:e.voiceURI},dvoices);
			});
			dvoices.value=conf.defaultVoice;
			dvoices.onchange();
		}
		synth.onvoiceschanged();
		
		//	url rules
		const lrules=createElement("div",{classList:"flexinput"},tts_config);

		Lang.set_text(createElement("div",{},lrules),"Alerts.url_rules");

		const url_rules=createElement("select",{onchange:e=>{
			conf.url_rules=url_rules.value;
			ConfigManager.save();
		}},lrules);
		createElement("option",{innerText:"Ignore",value:0},url_rules);
		createElement("option",{innerText:"Domain",value:1},url_rules);
		createElement("option",{innerText:"All",value:2},url_rules);
		url_rules.value=conf.url_rules;
		
		
		//	sounds
		const sounds_config=createElement("div",{classList:conf.mode===1?"hide":""},container);
		
		const lsounds=createElement("div",{classList:"flexinput"},sounds_config);
		createElement("input",{type:"button",value:"🎧",onclick:()=>{this.play()}},lsounds);
		const sounds=createElement("select",{onchange:e=>{
			custom_sound.classList.toggle("hide",sounds.value!=="custom");
			conf.sound=sounds.value;
			this.update();
			this.play();
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

		const numbers=createElement("div",{classList:"flexinput"},container);
		createElement("input",{type:"checkbox",checked:conf.ignoreNumbers,onchange:e=>{
			const b=!conf.ignoreNumbers;
			conf.ignoreNumbers=b;
			e.target.checked=b;
			ConfigManager.save();
		}},numbers);
		Lang.set_text(createElement("span",{},numbers),"Alerts.ignoreNumbers");


		//createElement("hr",{},container);
		//const exceptions=new Groups(conf.exceptions,false,container);	
		
		return container;
	}

	static parse_urls(msg,r){
		return r==2?msg:msg.replace(/((?:(?:https?:\/\/)|(?:www\.))([-A-Z0-9\.]+)([-A-Z0-9+&\?@#\/%=~_\.|]+))/ig,r==1?"$2":"")
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