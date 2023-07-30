
class Panel{// Soy consciente de que hay ciertas lineas y funciones de esta clase y las vinculadas a esta clase son una verguenza para mi y mi familia, por favor no me reporteis.
	data
	current
	panel
	panel_list
	content_about
	content_access
	content_actions

	constructor(data){
		data.panel=this;
		const fieldset=document.createElement("fieldset")
		const legend=document.createElement("legend")
		const panel=document.createElement("div")
		const panel_left=document.createElement("div")
		const panel_right=document.createElement("div")
		const panel_list=document.createElement("ul")
		const panel_list_controls=document.createElement("div")
		
		Lang.set_text(legend,data.name)
		panel.classList="panel"
		panel.id=data.name+"_panel"
		panel_left.classList="panel_left"
		panel_right.classList="panel_right"
		panel_list.classList="panel_list"
		panel_list_controls.classList="panel_list_controls"

		const content_about=document.createElement("div")
		const content_access=document.createElement("div")
		const content_actions=document.createElement("div")

		this.data=data
		this.panel=panel
		this.panel_list=panel_list
		this.content_about=content_about
		this.content_access=content_access
		this.content_actions=content_actions
		this.exceptions=new Groups(content_access)

		data.list.forEach(e=>this.add_to_list(e))
		data.get_controls(this,panel_list_controls)
		
		
		panel_left.append(panel_list)
		panel_left.append(panel_list_controls)
		panel_right.append(content_about)
		panel_right.append(content_access)
		panel_right.append(content_actions)
		panel.append(panel_left)
		panel.append(panel_right)
		fieldset.append(legend)
		fieldset.append(panel)
		panels.append(fieldset)
		const x=this.panel_list.querySelector("li")
		if(x)
			x.onclick()
		
	}

	add_to_list(e){
		const li=document.createElement("li")
		const input=document.createElement("input")
		const span=document.createElement("span")
		input.type="checkbox"
		input.checked=e.enabled
		span.innerText=e.type
		li.append(input)
		li.append(span)
		this.panel_list.append(li)
		li.onclick=x=>{
			this.current=e
			this.panel_list.querySelectorAll("li").forEach(y=>y.classList.toggle("on",li===y))
			this.data.on_select(e)
		}
		input.onclick=e=>{
			e.stopPropagation()
			// activar / desactivar el elemento
			// Config.save()
		}
	}

	default_controls(div){
		[
			["panel.controls_add"	,"+",Panel.button_add],
			["panel.controls_rmv"	,"x",Panel.button_rmv],
			["panel.controls_up"	,"⇧",Panel.button_up],
			["panel.controls_down"	,"⇩",Panel.button_down],
		].forEach(e=>div.append(this.create_input(...e)))
	}

	create_input(title,value,onClick){
		const bt=document.createElement("input")
		bt.type					="submit"
		bt.value				=value
		Lang.set_title(bt,title)
		bt.onclick				=e=>onClick(this)
		return bt
	}

	static button_add(t){
		//esto debería llamar a una función para crear custom entries
		const x={
			"type":"on_message",
			"enabled":true,
			"actions":[
			{
				"type":"send_message",
				"params":[
					[
						["twitch","presuntamente"],
						["{platform}","{channel}"],
					],
					"mensaje enviado por {sender}: {raw_msg}"
				]
			}
			]
		}
		t.data.list.push(x)
		t.add_to_list(x)
		t.panel_list.childNodes[t.data.list.length-1].onclick()
	}

	static button_rmv(t){
		const i=t.data.list.findIndex(e=>e===t.current)
		if(i===-1)
			return;
		t.data.list.splice(i,1)
		t.panel_list.childNodes[i].remove()
		if(t.panel_list.childNodes.length===0){
			t.panel.querySelector(".panel_right").innerText=""
			t.current=null
		}else
			t.panel_list.childNodes[Math.min(i,t.data.list.length-1)].onclick()
	}

	static button_up(t){
		const i=t.data.list.findIndex(e=>e===t.current)
		if(i<1)
			return;
		Panel.swap(t.data.list,i,i-1)
		t.panel_list.insertBefore(t.panel_list.childNodes[i],t.panel_list.childNodes[i-1]);
	}

	static button_down(t){
		const i=t.data.list.findIndex(e=>e===t.current)
		if(i===-1 || i>=t.data.list.length-1)
			return;
		Panel.swap(t.data.list,i,i+1)
		t.panel_list.insertBefore(t.panel_list.childNodes[i+1],t.panel_list.childNodes[i]);
	}

	static swap(e,i,o){
		const x=e[i]
		e[i]=e[o]
		e[o]=x
	}



	default_about(e){// en vez de recargar en cada clic, quizá sea mejor crear los divs y luego cambiar el contenido en la selección.
		const title=document.createElement("div")
		const desc=document.createElement("div")
		title.innerText=e.type
		Lang.set_text(desc,"events."+e.type)
		this.content_about.innerText=""
		this.content_about.append(title)
		this.content_about.append(desc)
	}

	default_access(e){
		console.log(e.access)
		this.exceptions.display(e.access)
		//this.content_access.append(this.exceptions.container)
	}

	default_actions(e){
		this.content_actions.innerHTML="aqui una lista donde agregar y borrar acciones"
	}
}



class Actions{
	static list=[
	{
		"name":		"send_message",			//	send message (sending commands as message may not work in all platforms)
		"method":	Actions.send_message,
		"options":	[],
	},
	{
		"name":		"send_rand_message",	//	send_message() pero con un texto aleatorio de entre los disponibles.
		"method":	Actions.send_message,
		"options":	[],
	},
	{
		"name":		"TTS",					//	Text to speach message
		"options":	[],
	},
	{
		"name":		"TTS_msg",				//	Text to speach message ([default voice]user: [user voice]mesage)
		"method":	Actions.tts_message,
		"options":	[],
	},
	{
		"name":		"audio",				//	Queued audio
		"options":	[],
	},
	{
		"name":		"alert",				//	Sound alert (no queued audio)
		"options":	[],
	}
	]

	static send_message(channels,msg){	//	Actions.send_message([["twitch","presuntamente"],["twitch","seyacat"]],"test")
		channels.forEach(e=>{
			const platform	=e[0]
			const channel	=e[1]
			if(platform==="twitch")
				TMI.send(channel,msg)
		})
	}

	static tts_message(user,msg){	//	Actions.send_message([["twitch","presuntamente"],["twitch","seyacat"]],"test")
		TTS.speak_msg(user,msg)
	}
}


class SEvents{	// Stream Events
	static panel
	static name="events"
	static events=[
	{
		"name":			"on_message",	//	non command/donation message
		"options":	[]
	},
	{
		"name":			"on_donation",	//	any donation type
		"options":	[]
	},
	{
		"name":			"on_sub",		//	twitch sub		/ youtube join
		"options":	[]
	},
	{
		"name":			"on_reward",	//	twitch reward
		"require":		"twitch",
		"options":	[]
	},
	{
		"name":			"on_raid",		//	twitch message including bits
		"require":		"twitch",
		"options":	[]
	},
	{
		"name":			"on_bits",		//	twitch message including bits
		"require":		"twitch",
		"options":	[]
	},
	/*{
		"name":			"on_follow",	//	twitch follow	/ youtube sub
		"options":	[]
	}*/
	];
	static list=[
	{
		"type":"on_message",
		"enabled":true,
		"access":{
			"groups":[],
			"users":[]
		},
		"actions":[
		{
			"type":"send_message",
			"params":[
				[
					["twitch","presuntamente"],
					["{platform}","{channel}"],
				],
				"mensaje enviado por {sender}: {raw_msg}"
			]
		},
		{
			"type":"alert",
			"params":[
				[
					["twitch","presuntamente"],
					["{platform}","{channel}"],
				],
				"mensaje enviado por {sender}: {raw_msg}"
			]
		}
		]
	},
	{
		"type":"on_donation",
		"enabled":true,
		"access":{
			"groups":[],
			"users":[]
		},
		"actions":[]
	},
	{
		"type":"on_bits",
		"enabled":true,
		"access":{
			"groups":[],
			"users":[]
		},
		"actions":[]
	},
	{
		"type":"on_reward",
		"enabled":false,
		"access":{
			"groups":[],
			"users":[]
		},
		"actions":[]
	},
	{
		"type":"on_sub",
		"enabled":false,
		"access":{
			"groups":[],
			"users":[]
		},
		"actions":[]
	}
	];

	static start(){
		SEvents.panel=new Panel(SEvents)
	}

	static on_event(event,platform,channel,sender,msg,data){
		SEvents.list.forEach(e=>{
			if(e.type===event)
				e.actions.forEach(action=>{
					// falta convertir parametros con {key}.
					Actions[action.type](...params)
				})
		})
		/*
			event:		string,
			platform:	string,
			channel:	string,
			sender:		string,
			msg:		string,
			data:		object


		Posibles parametros de data:
			- platform (la plataforma desde la que se ejecuta el evento)
			- string (twitch,youtube)
			- channel (canal desde el que se ejecuta el evento)
			- string (canal definido por el usuario)
			- sender	(usuario que ejecuta el evento)
			- raw_msg	(mensaje enviado)
			- msg		(mensaje enviado limpio (sin emotes))
			- html_msg	(mensaje enviado procesado (con imagenes))

		channels = [
			["twitch","seyacat"],
			["twitch","samugarron"]
			["youtube","samugarron"]
		]
		*/
		
	}

	static get_controls(panel,div){
		panel.default_controls(div)
	}

	static on_select(e){
		SEvents.panel.default_about(e)
		SEvents.panel.default_access(e)
		SEvents.panel.default_actions(e)
	}
}

class Commands{
	static panel;
	static name="commands"
	static list=[
	{
		"type":"!test",
		"enabled":true,
		"access":{
			"groups":["broadcaster"],
			"users":[]
		},
		"actions":[
		{
			"type":"send_message",
			"params":[
				[
					["twitch","presuntamente"],
					["{platform}","{channel}"],
				],
				"mensaje enviado por {sender}: {raw_msg}"
			]
		}
		]
	}
	]

	static start(){
		Commands.panel=new Panel(Commands)
		//aquí debería cargar los comandos a Commands.list.
		//Commands.list=["voice"]
	}

	static cmd(platform,channel,user,color,msg){//return false if command not exist
		const cmd=msg.split(" ")[0].substring(1)
		if(!Commands.list.includes(cmd))
			return false;
		return Commands[cmd](platform,channel,user,color,msg);
	}

	static voice(platform,channel,user,color,msg){
		return TTS.voiceCommand(platform,channel,user,color,msg)
	}

	static get_controls(panel,div){
		panel.default_controls(div)
	}

	static on_select(e){
		Commands.panel.default_about(e)
		Commands.panel.default_access(e)
		Commands.panel.default_actions(e)
	}
}


class Timers{
	static panel
	static name="timers"
	static list=[]

	static start(){
		Timers.panel=new Panel(Timers)
	}

	static get_controls(panel,div){
		panel.default_controls(div)
	}

	static on_select(e){
		Timers.panel.default_about(e)
		Timers.panel.default_access(e)
		Timers.panel.default_actions(e)
	}
}