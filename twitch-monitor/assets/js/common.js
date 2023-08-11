class Events{
	static events={};
	static on(e,f){
		if(typeof f!=="function")
			console.error("Events.on(string event,function function)",e,f)
		else if(!this.events[e])
			this.events[e]=[f]
		else if(!this.events[e].includes(f))
			this.events[e].push(f)
	}

	static remove(e,f){
		if(!this.events[e])
			return;
		let x=this.events[e].indexOf(f)
		if(x>-1)
			this.events[e].splice(x,1)
	}

	static remove_all(e){
		this.events[e]=[]
	}

	static dispatch(...p){
		const e=p.shift();
		//console.log("event",e,...p);
		if(this.events[e])
			this.events[e].forEach(e=>e(...p))
	}
}
//		Cut 🡻 Here
//					/*
window.Events=Events;	//	Para poder llamarse desde Apps
/*/

//*/

function createElement(type,attrs={},parent=null){
	const e=document.createElement(type);
	Object.entries(attrs).forEach(([k,v])=>e[k]=v);
	parent && parent.append(e);
	return e;
}

function nonce(length){	// https://www.thepolyglotdeveloper.com/2015/03/create-a-random-nonce-string-using-javascript/
	const possible="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let text="";
	for(let i=0;i<length;i++)
		text+=possible.charAt(Math.floor(Math.random()*possible.length));
	return text;
}


function multimenu_click(div,onClick){
	div.querySelectorAll(".menu>*").forEach(b=>{
		b.onclick=e=>{
			let i=0;
			div.querySelectorAll(".menu>*").forEach((b2,i2)=>{
				b2.classList.toggle("on",b===b2);
				if(b===b2)
					i=i2;
			});
			div.querySelectorAll(".content>div").forEach((c,i2)=>c.classList.toggle("hide",i!==i2))
			onClick && onClick(b,!!e);
		}
	});
}










/*
cosas que puede que se requieran en algún lugar y momento
*/

function channels_to_array(v){
	return v.split(",").map(c=>normalize_channel(c)).filter((c,i,a)=>a.indexOf(c)===i && c);
}

function normalize_channel(c){
	return c.trim().toLowerCase();
}

String.prototype.splice=function(start,length,replacement){
    return this.substr(0,start)+replacement+this.substr(start+length);
}


function xor_msg(params,conf){
	const g=(conf.groups.length===0 || (params.badges && conf.groups.findIndex(x=>params.badges.includes(x))>=0));
	const u=conf.users.includes(params["display-name"].toLowerCase());
	return g^u;
}


function array_toggle(arr,item){	//	https://stackoverflow.com/a/39349118/3875360
	const i=arr.indexOf(item);
	if(i!==-1)
		arr.splice(i,1);
	else
		arr.push(item);
}


function currentScriptPath(level=1){
	let line=(new Error()).stack.split('\n')[level+1].split('@').pop();
	return line.substr(0,line.lastIndexOf('/')+1);
};


