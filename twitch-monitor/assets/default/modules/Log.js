class Log extends Module{	// Esta clase registra la actividad. También permite enviar mensajes si estás autentificado.
	static chat_channels;
	static view_channels;

	static config={
		"index":0,
		"max_entries":5000
	}

	static start(){
		Events.on("channel.message",Log.on_channel_message)
		Events.on("chat.action",Log.on_chat_action)
		Events.on("chat.clearchat",Log.on_chat_clear)
		Events.on("chat.clearmsg",Log.on_chat_clear_msg)
	}

	static on_chat_clear(response){
		const x=chat_area.querySelectorAll("#log_chat [data-channel='"+response.channel+"']"+(response.msg?"[data-user='"+response.msg+"']":"")).forEach(e=>{
			e.style="text-decoration:line-through"
		})
		//Log.system(platform,"CLEARCHAT",channel,user)
	}

	static on_chat_clear_msg(response){
		const x=chat_area.querySelector("#log_chat [data-msg-id='"+response.id+"']")
		if(x)
			x.style="text-decoration:line-through"
		//insertar registro en system
	}

	static on_channel_message(response){
		Log.on_chat_action(response);
	}

	static on_chat_action(response){
		const content=document.createElement("div")
		content.dataset.type=response.type
		content.dataset.platform=response.platform
		content.dataset.channel=response.channel

		const time=document.createElement("span")
		time.innerText=new Date().toLocaleTimeString()
		content.append(time)
		
		if(response.subtype){
			const subtype=document.createElement("span")
			subtype.innerText="["+response.subtype+"]"
			content.append(subtype)
		}
		
		const channel=document.createElement("span")
		channel.innerHTML=Log.getChannelUrl(response.platform,response.channel)
		content.append(channel)
		
		if(response.sender){
			const sender=document.createElement("b")
			sender.innerHTML=response.sender.username
			if(response.sender.color)
				sender.style.color=response.sender.color
			content.append(sender)
		}
		
		const msg=document.createElement("span")
		msg.innerText=response.msg	// .innerHTML permite html, .innerText protege de inyecciones
		content.append(msg)
		
		
		const h=Log.log_chat.scrollHeight
		Log.log_chat.append(content)
		Log.log_chat.scrollTop+=Log.log_chat.scrollHeight-h;
	}


	static system(platform,action,channel,msg){
		let x=new Date().toLocaleTimeString()+" <span>["+action+"]</span>"
		if(channel)	x+=Log.getChannelUrl(platform,channel)
		if(msg)		x+=" "+msg
		Log.insert("<div>"+x+"</div>")
	}

	static chat(platform,channel,user,user_color,msg,msg_id,nonce){
		Log.insert("<div data-channel='"+channel+"' data-user='"+user+"' data-msg-id='"+msg_id+"'"+(nonce?"data-nonce="+nonce:"")+">"+new Date().toLocaleTimeString()+Log.getChannelUrl(platform,channel)+" <b "+(user_color?"style='color:"+user_color+"'":"")+">"+user+"</b>: <span>"+msg+"</span></div>")
	}

	static rewards(platform,action,channel,user,data){}

	static monetization(platform,action,channel,user,data){}

	static insert(msg){
		this.config.index++;
		if(this.config.index>=this.config.max_entries)	// En vez de borrar debería cambiar y añadir al final con 
			this.log_chat.querySelector("div").remove();
		Log.log_chat.append(createElement("div",{innerHTML:msg}))
		
	}

	static getChannelUrl(platform,channel){
		return " "+(platform==="Twitch"?"<a href='https://www.twitch.tv/"+channel+"' target=_blank class="+platform+">#"+channel+"</a>":"<b class="+platform+">#"+channel+"</b>")
	}




	static getPanel(){
		const conf=config.modules.Log;
		
		const container=createElement("div",{className:"multimenu"});
		const log_menu=createElement("div",{className:"menu"},container);
		const content=createElement('div',{className:'content'},container);
		
		this.view_channels=new Channels(conf.view_channels,true,log_menu);

		ACTION_TYPES.forEach(e=>{
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
		})

		this.log_chat=createElement('div',{classList:"textarea",onmouseup:e=>{
			if(conf.height==e.target.style.height)
				return;
			conf.height=e.target.style.height;
			ConfigManager.save();
		}},content);
		this.log_chat.style.height=conf.height;
		
		const form=createElement('form',{id:'log_chat_form',className:'flexinputrtl',onsubmit:e=>{
			e.preventDefault();

			const form=e.target;
			const channels=[];//=this.view_channels.getChannels();
			const msg=form.querySelector("[name=msg]").value;

			if(msg==="" || channels.length===0 || e.submitter.localName==="button")
				return;
			Actions.send_message(channels,msg);
			form.querySelector("[name=msg]").value="";
		}},container);

		form.dataset.require='login';
		Lang.set_value(createElement("input",{type:"submit"},form),"send");
		createElement("input",{type:"text",name:"msg"},form);
		
		this.chat_channels=new Channels(conf.chat_channels,false,form);
		return container;
	}
}
window.modules.Log=Log;