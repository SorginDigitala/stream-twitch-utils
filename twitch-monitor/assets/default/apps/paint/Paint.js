class Paint extends App{
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
	}


	static getPanel(){
		const container=createElement('div',{innerText:"aoeuoaeu"});
		return container;
	}
}
window.apps.Paint=Paint;