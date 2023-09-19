class App{
	static config={apikey:"aeou",minTime:300};
	static queue=[];
	static timer;

	static start(opt){
		console.log("start",opt);
		//if(opt)
		//	this.config=opt;

		this.enable(true);
	}

	static enable(b){
		console.log("enable",b);
		w.Events[b?"on":"remove"]("channel.message",()=>{this.onMsg});
	}


	static onMsg(data){
		console.log("onMsg",data);
		if(data.type!=="chat")
			return;

		this.addToQueue(data.msg);
	}

	static async search(q){
		//return "https://media3.giphy.com/media/dw36yjtOAtuSZyxEJG/giphy.gif?cid=edff8f7544ef05252b64498289b7822b8ef3e8013cbb40b3&ep=v1_gifs_random&rid=giphy.gif&ct=g";
		const x=await fetch("https://api.giphy.com/v1/gifs/random?api_key="+this.config.apikey+"&tag="+q+"&rating=g",{ method: "GET" })
		const r=await x.json();
		return r.data.images.url;
	}

	static addToQueue(query){
		this.queue.push(query);
		if(!this.timer)
			this.play();
	}

	static async play(){
		if(this.queue.length===0)
			return;
		const query	=this.queue.shift(),
			url		=await this.search(query),
			bytes	=await fetch(url).then(r=>r.arrayBuffer()).then(r=>new Uint8Array(r)),
			b64		="data:image/jpg;base64,"+bytesToBase64(bytes),//	btoa(String.fromCharCode(...bytes)),
			duration=getGifDuration(bytes),
			time	=this.calcDuration(duration,this.config.minTime);
			
		
			img.src=b64;
			msg.innerText=query;
			container.classList.toggle("hide",false);
			this.timer=setTimeout(()=>{
				container.classList.toggle("hide",true);
				this.timer=null;
				this.play();
			},time*1000);
	}

	static calcDuration(duration,minTime){
		if(duration>minTime*.65)
			return duration;
		return (minTime/duration)*duration+duration;
	}
}
window.intercom=App;
window.w=null;

//	https://stackoverflow.com/questions/69564118/how-to-get-duration-of-gif-image-in-javascript/74236879#74236879
function getGifDuration(uint8){
	let duration=0;
	const len=uint8.length;
	for(let i=0;i<len;i++){
		if(		uint8[i]==0x21
			&& uint8[i+1]==0xF9
			&& uint8[i+2]==0x04
			&& uint8[i+7]==0x00
		){
			const delay=(uint8[i + 5] << 8) | (uint8[i + 4] & 0xFF);
			duration+=delay<2?10:delay;
		}
	}
	return duration/100;
}

//	https://stackoverflow.com/questions/53723962/arraybuffer-as-source-image-tag-display-image-from-blob/53725348#53725348
function bytesToBase64(bytes) {
	let binary="";
	const len=bytes.byteLength;
	for(let i=0;i<len;i++)
		binary+=String.fromCharCode(bytes[i]);
	return window.btoa( binary );
}	


