class Module{

	//	
	static start(data){
		console.error(this.name+".start()",data);
	}

	static enable(b){
		console.error(this.name+".enable(b)",b);
	}

	static remove(){
		console.error(this.name+".remove()");
	}

	static getPanel(){
		console.error(this.name+".getPanel()");
	}
}