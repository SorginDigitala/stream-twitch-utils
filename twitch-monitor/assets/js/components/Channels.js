class Channels{
	channels=[];
	checknewchannels=false;
	container;
	onchange;

	constructor(channels,checknewchannels=false,container=null,onchange=null){
		this.channels=channels;
		this.checknewchannels=checknewchannels;
		this.onchange=onchange;

		if(container)
			this.create(container);

		Events.on("channels.update",(...x)=>{this.update(...x)})
		PlatformManager.getChannels().forEach(p=>{
			this.update(p[0],p[1],[],[])
		});
	}

	create(c){
		const container=createElement("button",{className:'button dropdown menuBox',onclick:e=>{}},c);
		this.container=container;
		
		const div=createElement("div",{},container);
		this.counter=createElement("span",{classList:"channel_count",innerText:"0"},div);
		Lang.set_text(createElement("span",{},div),"channels");
		createElement('ul',{className:'dropdownMenu'},container);

		return container;
	}

	isOn(p,c){
		const b=this.channels[p][c];
		return typeof(b)=="boolean"?b:this.checknewchannels;
	}

	getChannels(){
		let channels={};
		Object.keys(this.channels).forEach(p=>{
			channels[p]=platforms[p].getChannels().filter(x=>{
				const val=this.channels[p][x];
				return typeof(val)=="boolean"?val:this.checknewchannels;
			});
			

		});
		return channels;
	}

	update(platform,channels,leave,join,xx){
		let container=this.container.querySelector("[data-platform="+platform+"]")
		if(!container){
			container=createElement("div",{},this.container.querySelector("ul"));
			container.dataset.platform=platform;
		}else
			container.innerHTML="";
		let count=0;
		channels.forEach(e=>{
			const li=createElement("li",{},container);
			const label=createElement("label",{},li);
			const val=this.channels[platform][e];
			const checked=typeof(val)=="boolean"?val:this.checknewchannels;
			createElement("input",{type:"checkbox",checked:checked,onchange:x=>{
				this.channels[platform][e]=x.target.checked;
				this.counter.innerText=parseInt(this.counter.innerText)+(x.target.checked?1:-1);
				this.onchange && this.onchange();
			}},label);
			createElement("span",{innerText:e},label);
			if(checked)
				count++;
		});
		
		this.counter.innerText=count.toString();

		xx && this.onchange && this.onchange();
	}
}