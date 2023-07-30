class TwitchManager{
	static start(){
		Events.add("Twitch.channels.update",TwitchManager.save)
		Events.add("Twitch.login",TwitchManager.on_login)
		//Events.add("chat.action",generic_command)
	}

	static on_login(b){
		TMI.start()
		if(b)
			PubSub.start()
	}

	static save(){
		Config.save()
	}
}









/*
function generic_command(r){
	if(r.type!=='chat')
		return
	if(r.msg==='!welcome')
		Actions.send_message([["twitch",r.channel]],"https://www.youtube.com/watch?v=k1BneeJTDcU")
}


function lois_raid(e){
	const count=parseInt(e.params["msg-param-viewerCount"])
	let msg="";
	let arr
	const name=e.params["msg-param-displayName"];
	if(count===1){
		arr=[
			"con 1 guerrero semidesnudo",
			"con 1 loco y su espada",
			"con medio batallón de 2 dos personas",
			"con algo que parece una persona",
			"con todos sus amigos imaginarios",
			"sin espectadores ni dignidad"
		]
	}else{
		arr=[
			"con "+count+" guerreros en bolandas",
			"con un ejercito de "+count+" personas",
			"con "+count+" guerreros y guerreras",
			"con "+count+" guerreros con faldas y gaitas",
			"con "+count+" guerreros con faldas y gaitas a juego",
			"con "+count+" guerreros, guerreras, guerreres y helicopteros. correr!",
			"con "+count+" locos",
			"con "+count+" personas y personajes",
			"con la un montón de gente, siendo un montón una cantidad indefinida de entre "+(count-1)+" y "+(count+1)
		]
	}
	msg=arr[Math.floor(Math.random()*arr.length)]
	const phrases=[
		"Que nos acaba de invadir",
		"Que nos acaba de raidear",
		"Que nos acaba de raidear a lo bestia",
		"Que viene",
		"Se nos ha echado encima",
		"El fiera se nos viene"
	]
	const phrase=phrases[Math.floor(Math.random()*phrases.length)]
	Actions.send_message([["twitch",e.channel]],"Entrad al canal de "+name+" en este maldito enlace: https://www.twitch.tv/"+e.params["msg-param-login"]+" - "+phrase+" "+msg+".")
	Actions.send_message([["twitch",e.channel]],"!hola")
}



var rafa_started_at="";
function on_update_streams(r){
	r.forEach(e=>{
		if(e.user_login==='rafalagoon' && rafa_started_at!==e.started_at){
			rafa_started_at=e.started_at;
			setTimeout(()=>TMI.send("rafalagoon","No puedo enviarte recompensas, pero esto te lo comes: 8==D"),60000)
		}
	});
}


function luis420(){
	if(!Twitch.user)
		return
    const date=new Date()
	const hour=date.getHours()%12
	const minutes=date.getMinutes()


	if(minutes===5 && document.querySelector("[data-id='rafalagoon']:not(.hide)"))
		Actions.send_message([["twitch","rafalagoon"]],"Quieres saber más de @rafalagoon ? Twitter: https://twitter.com/RafaLagoon Youtube: https://www.youtube.com/rafalagoon Discord: http://discord.rafalagoon.com/ más redes: https://linktr.ee/rafalagoon Addon que no tiene: https://addons.mozilla.org/es/firefox/addon/ublock-origin/")

	if(hour===4 && minutes===20)
		Actions.send_message([["twitch","loisdefazouro"],["twitch","demiontus"]],"4:20")
}
setInterval(luis420,60000)
*/
