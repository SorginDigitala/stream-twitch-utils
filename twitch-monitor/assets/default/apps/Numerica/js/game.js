//	Para el diseño se podría meter algo como esto
	//	https://omrelli.ug/smoke.js/
	//	https://codepen.io/Marc_on_dev/pen/bQGGLR


class Game{
	static options;

	static lastPlayer;
	static score;

	static start(opt){
		console.log("start",opt);
		if(opt)
			this.options=opt;

		this.score=0;
		window.score.innerText="0";
		this.lastPlayer="";

		this.enable(true);
	}

	static enable(b){
		console.log("enable",b);
		w.Events[b?"on":"remove"]("channel.message",this.onMsg);
	}


	static onMsg(data){
		console.log("onMsg",data);
		if(data.type!=="chat")
			return;
		const score=Number(data.raw_msg),
			username=data.sender.username;
		if(
			!Number.isInteger(score)
		||	score<1
		||	(Game.score===0 && score!==1)
		//||	(!this.options.ban_mods && data.isMod)
		||	(Game.options.ignore_lastplayer && username===Game.lastPlayer)
		)
			return;

		if(Game.lastPlayer && username===Game.lastPlayer){
			Game.ban(username,Game.options.ban_min);
			return;
		}

		Game.play(username,score);
	}

	static play(username,score){
		console.log("score:",username,score);
		
		if(this.score+1===score){
			this.lastPlayer=username;
			this.score=score;
			window.score.innerText=score.toString();
			lastPlayer.innerText=username;
			lastPlayer.classList.toggle("fail",false);
		}else
			this.gameover(username);
	}

	static gameover(loser){
		console.log("gameover",loser);
		this.enable(false);
		
		lastPlayer.innerText=loser;
		lastPlayer.classList.toggle("fail",true);
		window.score.innerText="0";

		if(this.score>this.options.data.highscore)
			this.updateHighScore(this.lastPlayer,this.score);

		this.ban(loser,Math.min(this.score*this.options.ban_multiplier,this.options.ban_min));
		setTimeout(()=>{
			this.start();
		},3000);
	}

	static ban(user,seconds){
		//	si es mod, anotar que es mod de forma persistente para devolverselo.
		//	llamar al panel para banear al user.
	}

	static vip(user,b){
		if(b){
			this.options.data.lastVip=user;
			//	vip user
		}else{
			this.options.data.lastVip=null;
			//unvip user
		}
	}

	static updateHighScore(player,score){
		this.options.data.highscore=score;
		this.options.data.highscore_player=player;

		highscore.innerText=score.toString();
		highscore_player.innerText=player;
		
		this.vip(this.options.data.lastVip,false);
		
		if(this.options.reward_vip
		//&&	!["vip","mod"].includes(userrole)?
		)
			this.vip(player,true);
	}
}
window.intercom=Game;
window.w=null;