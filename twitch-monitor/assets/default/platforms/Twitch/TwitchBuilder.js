
class TwitchBuilder{
	static form
	static channels
	static tmi_state
	static pubsub_state
	static auth

	static start(){
		Events.on("channels.update",TwitchBuilder.on_update_channels)
		Events.on("PubSub.ws",TwitchBuilder.on_pubsub_state)
		Events.on("TMI.ws",TwitchBuilder.on_tmi_state)
	}

	static on_pubsub_state(b){
		TwitchBuilder.pubsub_state.classList.toggle("on",b)
		/*
		const x=b?"log.connected":"log.disconnected";
		const msg="<span data-lang_text=\""+x+"\">"+Lang.get(x)+"</span>";
		new Action(
			"",
			"Twitch",
			"System",
			"PubSub",
			null,
			"",
			msg,
			msg,
			null
		);
		*/
	}

	static onLogin(b){
		if(!b)
			return;
		document.body.dataset.twitch="";
		document.body.dataset.login="";
		//	Si los canales son los que vienen por defecto: agregamos al usuario y a presuntamente para que la gente pueda testear
		if(Twitch.data.defaultOptions.channels.toString()===Twitch.config.channels.toString()){
			Twitch.config.channels.push(Twitch.user.login);
			Twitch.config.channels=[...new Set(Twitch.config.channels)];
			TwitchBuilder.channels.value=Twitch.config.channels.join(", ");
			TwitchBuilder.form.onsubmit();
		}
		
		TwitchBuilder.update_auth_html(b);
		TwitchBuilder.pubsub_state.classList.toggle("hide",false)
	}

	static on_tmi_state(b){
		TwitchBuilder.tmi_state.classList.toggle("on",b)
		/*
		if(b)
			Log.system("twitch","TMI",null,"<span data-lang_text=log.connected>"+Lang.get("log.connected")+"</span>")
		else
			Log.system("twitch","TMI",null,"<span data-lang_text=log.disconnected>"+Lang.get("log.disconnected")+"</span>");
		*/
	}

	static on_update_channels(platform){
		if(platform!=="Twitch")
		TwitchBuilder.channels.value=Twitch.config.channels.join(", ");
	}

	static update_auth_html(b){
		TwitchBuilder.auth.innerHTML="";
		if(!b)
			Lang.set_text(createElement("a",{href:TwitchAPI.url},TwitchBuilder.auth),"login");
		else{
			createElement("a",{innerText:'Logout',onclick:Twitch.logout,href:'#',style:'margin:0 5px'},TwitchBuilder.auth);
			createElement("span",{innerText:Twitch.user.login+" ("+Twitch.user.display_name	+")"},TwitchBuilder.auth);
		}
	}

	static build(){
		const conf=config.platforms.Twitch;
		
		const form=createElement("form",{className:"flexinput"});
		
		
		TwitchBuilder.tmi_state=createElement("div",{className:"ws_status",title:"TMI State"},form);
		TwitchBuilder.pubsub_state=createElement("div",{className:"ws_status hide",title:"PubSub State"},form);
		TwitchBuilder.channels=createElement("input",{type:"text",name:"channels",value:conf.channels.join(", ")},form);
		Lang.set_placeholder(TwitchBuilder.channels,"twitch.placeholder");

		const button=createElement("input",{type:'submit',className:'button'},form);
		Lang.set_value(button,"join")

		form.onsubmit=e=>{
			if(e){
				e.preventDefault();
				TwitchAPI.update_channels(TwitchBuilder.channels.value,true);
			}
		}
		
		const twitch=createElement('div');

		TwitchBuilder.auth=createElement("div",{},twitch);
		TwitchBuilder.update_auth_html(false);

		TwitchBuilder.form=form;
		twitch.append(form);
		Lang.set_text(createElement("p",{},twitch),"twitch.description")
		
		
		const details=createElement('details',{},twitch);
		createElement('summary',{innerText:'Developer Area'},details);
		const div=createElement('div',{},details);
		
		const label=createElement('label',{innerText:'ClientId'},div);
		createElement('p',{innerHTML:'Requerido para la autenticación del usuario. Déjalo en blanco para usar el valor por defecto. Mas info en <a href="https://dev.twitch.tv/console" target=_blank>Twitch Developers</a>'},label);
		const div2=createElement('form',{className:'flex'},label);
		const input=createElement('input',{type:'text',value:conf.clientId},div2);
		const submit=createElement('button',{type:'submit',className:'button'},div2);
		Lang.set_text(submit,'update');
		
		div2.onsubmit=e=>{
			e.preventDefault();
			if(input.value==='')
				input.value=Twitch.data.defaultOptions.clientId;
			conf.clientId=input.value;
			Config.save();
			const a=TwitchBuilder.auth.querySelector('a');
			if(a){
				a.href=TwitchAPI.authUrl();
			}
		}
		
		createElement("div",{innerHTML:"Puedes eliminar los permisos ya dados en <a href=\"https://www.twitch.tv/settings/connections\" target=_blank>Conexiones</a>"},div);
		
		const lpermissions=createElement("label",{innerText:"Permisos"},details);
		createElement("p",{innerHTML:"Lista de permisos requeridos por la app de twitch"},lpermissions);
		//	falta toda esta mierda
		
		return twitch;
	}

	static check_enable(b){
		Twitch.config.enabled=b
		Events.dispatch("Twitch.enable",b)
	}
}