
class Log{
	static messages=[];

	static start(){
		["PRIVMSG","CLEARCHAT","CLEARMSG"].forEach(e=>Events.add(e,Log[e]));
		["JOIN","PART","CLEARCHAT"].forEach(e=>Events.add(e,Log.log));

		
		document.querySelectorAll("#log_menu>[data-show]").forEach(b=>{
			b.onclick=(e)=>document.querySelectorAll("#log_menu>[data-show]").forEach(o=>{
			logs.classList=e.target.dataset.show;
			/*
				let y=document.getElementById(o.dataset.show);
				y.classList.toggle("hide",y.id!==e.target.dataset.show)
			*/
			});
		});
		//document.querySelector("#log_menu>div").click();
	}

	static PRIVMSG(msg){
		Log.messages.push(msg);
		//falta pasar emotes a imagenes.
		chat_log.innerHTML+="<div data-msg-id='"+msg.params.id+"' data-user='"+msg.user+"'>#"+msg.channel+" <span style='color:"+msg.params.color+"'>"+msg.user+"</span>: <span>"+msg.raw_msg+"</span></div>";
	}

	static CLEARCHAT(msg){
		//hay que marcar como borrados los mensajes de x canal
		//chat_area.querySelectorAll("#chat_log [data-user='"+msg.raw_msg+"'] span").forEach(x=>x.style="text-decoration:line-through");
	}

	static CLEARMSG(msg){
		const x=chat_area.querySelector("#chat_log [data-msg-id='"+msg.params["target-msg-id"]+"'] span:nth-child(2)");
		if(x){
			x.style="text-decoration:line-through";
			log(msg.type,msg.channel,x,msg.msg);
		}
	}

	static log(msg){
		log(msg.type,msg.channel,msg.msg);
	}
}