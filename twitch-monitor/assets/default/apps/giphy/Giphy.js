class Giphy extends App{
	static width	=340;
	static height	=400;

	static start(){
		this.enable(config.modules[this.name].enabled);
		
		window.addEventListener('load', () => {
			const popup = window;
			popup.addEventListener("resize",()=>{popup.resizeTo(306,512)})
		});
	}

	static remove(){
		this.enable(false);
	}

	static enable(b){
	}

	static currentScriptPath(level=0){
		let line=(new Error()).stack.split('\n')[level+1].split('@').pop();
		return line.substr(0,line.lastIndexOf('/')+1);
	};

	static play(){
		const app=data.apps.find(e=>e.id==="Giphy");
		
		const params=
			"width="+this.width+","+
			"height="+this.height+","+
			"left=0,"+
			"top=0";
		const w=window.open(app.path+"index.htm","_myTarget__"+this.name,params);
		
		if(!w){
			console.error("Sin permisos para abrir popups");
		}
		
		window.onbeforeunload=()=>w.close();
		w.onload=()=>{
			w.onresize=()=>{
				w.resizeTo(
					this.width+(w.outerWidth-w.innerWidth),
					this.height+(w.outerHeight-w.innerHeight)
				);
				console.log(w.screenX,w.screenY);
			}
			w.onresize();
			//detectar movimiento de la ventana y guardarlo en la configuración
			
			//	test
			w.w=window;
			w.intercom.start({
				reward_vip		:true,
				ban_multiplier	:3,
				ban_min			:30,
				ignore_lastplayer	:true,
				ban_mods		:true,
				data:{
					highscore			:0,
					highscore_player	:"",
					vip					:null,
					banned_mods			:[
						["username",Date.now()],
						["username2",Date.now()],
					]
				}
			});
		};
	}


	static getPanel(){
		const container=createElement('div',{innerHTML:`
		Que opciones poner aquí: <br>
		- [select]		Opciones con las que activarse <br>
		- [2 inputs]	Tamaño de la pantalla <br>
		- [checkbox]	mostrar query <br>
		- [input type=password]	Giphy api key
		`});
		createElement("button",{onclick:e=>{
			this.play();
		}},container);
		
		return container;
	}
}
window.apps.Giphy=Giphy;