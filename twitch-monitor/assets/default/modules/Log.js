class Log extends Module{
	// Esta clase registra la actividad. También permite enviar mensajes si estás autentificado.
	
	static config={
		"index":0,
		"max_entries":5000,
		"div":null
	}

	static start(){
		Log.config.div=log_chat;
		Events.on("channel.message",Log.on_channel_message)
		Events.on("chat.action",Log.on_chat_action)
		Events.on("chat.clearchat",Log.on_chat_clear)
		Events.on("chat.clearmsg",Log.on_chat_clear_msg)
		Events.on("Twitch.channels.update",Log.on_update_channels)
		Log.on_update_channels()
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
		
		
		const h=log_chat.scrollHeight
		log_chat.append(content)
		log_chat.scrollTop+=log_chat.scrollHeight-h
	}

	static on_update_channels(){
		Blocks.channelMenu(
			log_menu,
			[],//config.log.chat_channels,
			Log.updateChannelsCount,
			true
		)
		Blocks.channelMenu(
			log_chat_form,
			[],//config.log.chat_channels,
			Log.updateChannelsCount
		)
	}

	static updateChannelsCount(){
		log_chat_form.querySelector(".channel_count").innerText=log_chat_form.querySelectorAll("[type=checkbox]:checked").length.toString()+"/"+config.platforms.Twitch.channels.length
		log_chat_form.querySelectorAll("[type=checkbox]").forEach(e=>{
			const exists=-1;//config.log.chat_channels.findIndex(x=>x[0]===e.dataset.platform && x[1]===e.dataset.channel)
			if(exists!==-1 && !e.checked)
				config.log.chat_channels.splice(exists,5)
			else if(exists===-1 && e.checked)
				config.log.chat_channels.push([e.dataset.platform,e.dataset.channel])
		})
	}


	static system(platform,action,channel,msg){
		let x=new Date().toLocaleTimeString()+" <span>["+action+"]</span>"
		if(channel)	x+=Log.getChannelUrl(platform,channel)
		if(msg)		x+=" "+msg
		Log.insert(Log.config,"<div>"+x+"</div>")
	}

	static chat(platform,channel,user,user_color,msg,msg_id,nonce){
		Log.insert(Log.config,"<div data-channel='"+channel+"' data-user='"+user+"' data-msg-id='"+msg_id+"'"+(nonce?"data-nonce="+nonce:"")+">"+new Date().toLocaleTimeString()+Log.getChannelUrl(platform,channel)+" <b "+(user_color?"style='color:"+user_color+"'":"")+">"+user+"</b>: <span>"+msg+"</span></div>")
	}

	static rewards(platform,action,channel,user,data){}

	static monetization(platform,action,channel,user,data){}

	static insert(config,msg){
		if(config.index>=config.max_entries)	// En vez de borrar debería cambiar y añadir al final con document.createElement
			log_chat.querySelector("div").remove()
		config.index++
		//const h=config.div.scrollHeight
		//config.div.innerHTML+=msg
		//config.div.scrollTop+=config.div.scrollHeight-h
	}

	static getChannelUrl(platform,channel){
		return " "+(platform==="Twitch"?"<a href='https://www.twitch.tv/"+channel+"' target=_blank class="+platform+">#"+channel+"</a>":"<b class="+platform+">#"+channel+"</b>")
	}




	static getPanel(){
		const container=createElement('div',{className:'multimenu'});
		const log_menu=createElement('div',{className:'menu',id:'log_menu'},container);
		
		
		const dropdown=createElement('button',{className:'button dropdown menuBox'},log_menu);
		createElement('div',{innerHTML:'<span class=channel_count>0</span> <span data-lang_text=channels>Channels</span>'},dropdown);
		createElement('ul',{className:'dropdownMenu'},dropdown);

		['system','chat','actions','monetization'].forEach(e=>{
			const x=createElement('button',{className:'button',onclick:e=>{}},log_menu);
			Lang.set_text(x,'log.'+e);
		})

		const content=createElement('div',{className:'content'},container);
		createElement('div',{id:'log_chat'},content);
		
		const form=createElement('form',{id:'log_chat_form',className:'flexinputrtl'},container);
		form.dataset.require='login';
		const input=createElement('input',{type:'submit'},form);
		Lang.set_value(input,'send');
		createElement('input',{type:'text',name:'msg'},form);
		const button=createElement('button',{className:'dropdown menuBox',onclick:e=>{e.preventDefault()}},form);
		createElement('div',{innerHTML:'<span class=channel_count>0</span> <span data-lang_text=channels>Channels</span>'},button);
		createElement('ul',{className:'dropdownMenu'},button);
		
		
		return container;
	}
}
window.modules.Log=Log;
