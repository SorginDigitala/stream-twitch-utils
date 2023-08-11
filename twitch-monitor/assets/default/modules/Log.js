class Log extends Module{	// Esta clase registra la actividad. También permite enviar mensajes si estás autentificado.
	static chat_channels;
	static view_channels;
	static log_chat;

	static config={
		"index":0,
		"max_entries":5000
	}

	static start(){
		this.enable(config.modules.Log.enabled);
	}
	
	static enable(b){
		Events[b?"on":"remove"]("channel.message",	this.on_channel_message);
		Events[b?"on":"remove"]("chat.action",		this.on_chat_action);
		Events[b?"on":"remove"]("chat.clearchat",	this.on_chat_clear);
		Events[b?"on":"remove"]("chat.clearmsg",	this.on_chat_clear_msg);
	}
	
	static onremove(){
		this.enable(false);
	}

	static on_chat_clear(response){
		const x=Log.log_chat.querySelectorAll("[data-platform='"+response.platform+"'][data-channel='"+response.channel+"']"+(response.msg?"[data-user='"+response.msg+"']":"")+":not([data-type=system])").forEach(e=>{
			e.style="text-decoration:line-through"
		})
	}

	static on_chat_clear_msg(r){
		const x=chat_area.querySelector("#log_chat [data-msg-id='"+r.id+"']")
		if(x)
			x.style="text-decoration:line-through"
	}

	static on_channel_message(r){
		Log.on_chat_action(r);
	}

	static on_chat_action(r){
		const conf=config.modules.Log;
		const d=new Date();
		const hours=d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0");

		const content=createElement("div",{classList:"chat",title:d.toLocaleTimeString().padStart(8,"0")});
		content.dataset.type=r.type;
		content.dataset.platform=r.platform;
		content.dataset.channel=r.channel;
		if(r.emoteonly)
			content.dataset.emoteonly="";
		if(r.channel)
			content.classList.toggle("hide",!Log.view_channels.isOn(r.platform,r.channel));

		createElement("span",{classList:"date",innerText:hours},content);
		
		if(r.subtype){
			if(r.subtype==="JOIN")
				createElement("span",{innerText:"🢂",classList:"green"},content);
			else if(r.subtype==="PART")
				createElement("span",{innerText:"🢀",classList:"red"},content);
			else
				createElement("span",{innerText:"["+r.subtype+"]"},content);
		}
		
		const span=createElement("span",{},content);
		Log.getChannelUrl(r,span);
		
		if(r.sender){
			content.dataset.user=r.sender.username;
			const sender=createElement("span",{classList:"chatuser",innerHTML:r.sender.displayname},content);
			sender.dataset.platform=r.platform;
			sender.dataset.username=r.sender.username;
			if(r.sender.color)
				sender.style.color=r.sender.color;
		}


		createElement("span",{classList:"msg",innerHTML:r.msg},content);
		
		
		const h=Log.log_chat.scrollHeight
		Log.log_chat.append(content)
		Log.log_chat.scrollTop+=Log.log_chat.scrollHeight-h;
	}

	static getChannelUrl(d,c){
		return createElement("a",{href:"https://www.twitch.tv/"+d.channel,target:"_blank",classList:d.platform,innerText:d.channel},c);
	}


	
	static on_view_channels_update(){
		const v=config.modules.Log.view_channels;
		Log.log_chat.parentNode.querySelectorAll("#log_chat>div").forEach(e=>{
			e.classList.toggle("hide",!Log.view_channels.isOn(e.dataset.platform,e.dataset.channel));
		});
	}

	static getPanel(){
		const conf=config.modules.Log;
		
		const container=createElement("div",{className:"multimenu"});
		const log_menu=createElement("div",{className:"menu"},container);
		const content=createElement('div',{className:'content'},container);
		
		this.view_channels=new Channels(conf.view_channels,true,log_menu,this.on_view_channels_update);


		function button(e){
			Lang.set_text(createElement("button",{className:"button"+(conf.display[e]?" on":""),onclick:x=>{
				const b=!conf.display[e];
				conf.display[e]=b;
				x.target.classList.toggle("on",b);
				if(b)
					content.dataset[e]="";
				else
					delete content.dataset[e];
				ConfigManager.save();
			}},log_menu),'log.'+e);
			if(conf.display[e])
				content.dataset[e]="";
		}
		button("show_emotes");
		ACTION_TYPES.forEach(e=>button(e))

		this.log_chat=createElement('div',{classList:"textarea",id:"log_chat",onmouseup:e=>{
			if(conf.height==e.target.style.height)
				return;
			conf.height=e.target.style.height;
			ConfigManager.save();
		}},content);
		this.log_chat.style.height=conf.height;
		
		const form=createElement('form',{id:'log_chat_form',className:'flexinputrtl',onsubmit:e=>{
			e.preventDefault();

			const form=e.target;
			const channels=this.chat_channels.getChannels();
			const msg=form.querySelector("[name=msg]").value;

			if(msg==="" || channels.length===0 || e.submitter.localName==="button")
				return;
			Object.entries(channels).forEach(entry=>{
				const [platform,channels]=entry;
				platforms[platform].send(channels,msg);
				
			});
			form.querySelector("[name=msg]").value="";
		}},container);

		form.dataset.require='login';
		Lang.set_value(createElement("input",{type:"submit"},form),"send");
		createElement("input",{type:"text",name:"msg"},form);
		
		this.chat_channels=new Channels(conf.chat_channels,false,form,null);
		return container;
	}
}
window.modules.Log=Log;