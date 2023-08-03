class Channels{
	container;
	channels;
	checknewchannels=false;

	constructor(channels,checknewchannels=false,container=null){
		this.channels=channels;
		this.checknewchannels=checknewchannels;

		if(container)
			this.create(container);

		Events.on("Twitch.channels.update",this.update)
	}

	create(c){
		const container=createElement("div",{},c);
		this.container=container;
		
		const dropdown=createElement('button',{className:'button dropdown menuBox',onclick:e=>{e.preventDefault()}},container);
		createElement('div',{innerHTML:'<span class=channel_count>0</span> <span data-lang_text=channels>Channels</span>'},dropdown);
		createElement('ul',{className:'dropdownMenu'},dropdown);
		return container;
	}

	update(){
		//	actualizar lista de plataformas y canales de this.container;
	}
}