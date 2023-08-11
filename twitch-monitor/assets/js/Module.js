class Module{

	//	
	static start(data){
		console.error(this.name+".start()",data);
	}

	static enable(b){
		console.error(this.name+".enable(b)",b);
	}

	static onremove(){
		console.error(this.name+".onremove()");
	}

	static getPanel(){
		console.error(this.name+".getPanel()");
		return createElement("div");
	}
}