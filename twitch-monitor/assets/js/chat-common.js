
class Blocks{	//	Esta clase debería crear la lista de canales.
	static channelMenu(div,activeChannels,onChange,inverse=false){
		/*
		const container=div.querySelector(".dropdownMenu")
		container.innerHTML=""
		config.platforms.Twitch.channels.forEach(e=>{
			const li=document.createElement("li")
			const label=createElement("label",{},li)
			const input=createElement("input",{
				type:'checkbox',
				checked:activeChannels.find(x=>x[0]==="twitch" && x[1]===e) && !inverse,
				onchange:e=>{onChange();Config.save()}
			},label);
			createElement("span",{innerText:e},label)
			li.dataset.require="twitch";
			input.dataset.platform="twitch"
			input.dataset.channel=e

			container.append(li)
		})
		onChange()
		*/
	}
}















/*



class Groups{
	static popup
	static popup_list
	static current
	container;
	input;
	textarea;

	static start(){
		const popup=document.createElement("div")
		const div=document.createElement("div")
		const p=document.createElement("p")
		const input=document.createElement("input")
		const list=document.createElement("div")
		const close=document.createElement("input")
		Groups.popup=popup
		Groups.popup_list=list
		
		popup.id="popup_groups"
		popup.className="hide"
		popup.onclick=e=>{
			if(e.target===e.currentTarget)
				Groups.hide()
		}
		div.id="popup_groups_container"
		Lang.set_text(p,"exceptions.popup_desc")
		input.type="text"
		Lang.set_placeholder(input,"exceptions.popup_placeholder")
		close.type="submit"
		Lang.set_value(close,"exceptions.popup_close")
		close.onclick=e=>Groups.hide()
		
		div.append(p)
		div.append(input)
		div.append(list)
		div.append(close)
		popup.append(div)
		document.body.append(popup)
		config.platforms.Twitch.grouplist.forEach(e=>Groups.add_to_list(e,true))
	}

	static add_to_list(x,starting=false){
		if(!starting){
			if(config.platforms.Twitch.grouplist.includes(x))
				return;
			config.platforms.Twitch.grouplist.push(x)
		}
		
		const label=document.createElement("label")
		const input=document.createElement("input")
		const span=document.createElement("span")
		input.type="checkbox"
		input.name=x
		input.onchange=Groups.on_update
		span.innerText=x
		label.append(input)
		label.append(span)
		Groups.popup_list.append(label)
	}

	static on_update(){
		Groups.current.on_update()
	}

	static hide(e){
		if(e && e.keyCode!==27)
			return;
		Groups.popup.classList.add("hide")
		document.removeEventListener('keydown',Groups.hide)
	}

	constructor(div){
		const groups=document.createElement("div")
		groups.className="groups"
		this.container=groups

		const label=document.createElement("label")
		const h2=document.createElement("h2")
		const p=document.createElement("p")
		const input=document.createElement("input")
		input.onclick=e=>this.display_popup();
		
		Lang.set_text(h2,"exceptions.groups")
		Lang.set_text(p,"exceptions.groups_desc")
		Lang.set_placeholder(input,"exceptions.groups_placeholder")
		input.type="text"
		input.className="exceptions"
		this.input=input
		
		label.append(h2)
		label.append(p)
		label.append(input)
		groups.append(label)

		const _label=document.createElement("label")
		const _h2=document.createElement("h2")
		const _p=document.createElement("p")
		const _textarea=document.createElement("textarea")
		this.textarea=_textarea
		
		_label.className="groups_textarea"
		Lang.set_text(_h2,"exceptions.exceptions")
		Lang.set_text(_p,"exceptions.exceptions_desc")
		Lang.set_placeholder(_textarea,"exceptions.exceptions_placeholder")
		_textarea.className="exceptions"
		_textarea.onchange=e=>{
			arr.users=channels_to_array(textarea.value)
			Config.save()
		}
		
		_label.append(_h2)
		_label.append(_p)
		_label.append(_textarea)
		groups.append(_label)
		div.append(groups)
	}

	on_update(){
		console.log("onclick")
		//Falta cambiar objeto con los datos del bloque.
		Config.save()
	}

	display(e){
		console.log(e.groups)
		this.input.value=e.groups.join(", ")
		
		//	input.value=arr.groups.join(", ")
		//	input.onchange=e=>{
		//		arr.groups=channels_to_array(input.value)
		//		Config.save()
		//	}
		//	textarea.value=arr.users.join(", ")
	}

	display_popup(){
		Groups.current=this
		//	Falta actualizar los .checked con los datos del bloque
		
		//	group_list.querySelectorAll("input").forEach(e=>{
		//		e.checked=arr.includes(e.name)
		//		e.onchange=(e=>{
		//			array_toggle(arr,e.target.name)
		//			input.value=arr.join(", ")
		//			Config.save()
		//		})
		//	})
		Groups.popup.classList.remove("hide")
		document.addEventListener('keydown',Groups.hide)
	}
}

*/
