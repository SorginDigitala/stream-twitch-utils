class Groups{
	container;
	options;	//	{Twitch:{groups:[],exceptions:[]}}
	checknewgroups=false;


	constructor(options,checknewgroups=false,container=null){
		this.options=options;
		this.checknewgroups=checknewgroups;

		if(container)
			this.create(container);

		//	chequear cuando se añaden nuevos grupos
		//	Events.on("Twitch.channels.update",this.update);
	}

	create(c){
		const container=createElement("div",{},c);
		
		const groups=createElement("label",{classList:"label"},container);
		Lang.set_text(createElement("h2",{},groups)	,"Grupos");
		Lang.set_text(createElement("p",{},	groups)	,"Que grupos pueden acceder a esta función.");
		Lang.set_placeholder(createElement("input",{type:"text",onchange:e=>{}},groups),"Déjalo en blanco para permitir a todos los usuarios.");

		const expceptions=createElement("label",{classList:"label"},container);
		Lang.set_text(createElement("h2",{},expceptions)	,"Excepciones");
		Lang.set_text(createElement("p",{},	expceptions)	,"Usuarios a los que incluir o excluir.");
		Lang.set_placeholder(createElement("textarea",{classList:"textarea small",onchange:e=>{}},expceptions),"Nombres de usuario a los que quieras\nactivar/desactivar las alertas.\nLos usuarios en esta lista que NO esten en un grupo activarán la alerta.\nLos usuarios en esta lista que pertenezcan a un grupo activo serán ignorados.");
		
		return container;
	}

	update(){
		//	actualizar lista de plataformas y canales de this.container;
	}
}