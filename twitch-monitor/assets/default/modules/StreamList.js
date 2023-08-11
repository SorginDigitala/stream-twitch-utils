
class StreamList{
	static twitch_channels=[]
	//static youtube_channels=[]

	static start(twitch,youtube){
		this.build_twitch(twitch)
	}

	static build_twitch(twitch){
		StreamList.on_update_twitch_channels([],twitch,twitch)
		Events.on("channels.update",StreamList.on_update_twitch_channels)
		//Events.on("Twitch.login",StreamList.get_streams_info)
		setInterval(StreamList.get_streams_info,12000)
	}

	static on_update_twitch_channels(platform,currentleave,join){
		leave.forEach(e=>{
			const i=StreamList.twitch_channels.findIndex(c=>c[0]===e)
			if(i>=0){
				StreamList.twitch_channels[i][1].remove()
				StreamList.twitch_channels.splice(i,1)
			}
		})
		if(join){
			join.forEach(e=>StreamList.twitch_channels.push([e,StreamList.build_stream_block("twitch",e)]))
			StreamList.get_streams_info()
		}
	}

	static get_streams_info(){
		if(Twitch.user)
			TwitchAPI.get_streams(StreamList.twitch_channels.map(e=>e[0])).then(e=>StreamList.update_twitch(e))
	}

	static update_twitch(streams){
		Events.dispatch("Twitch.on_update_streams",streams)
		StreamList.twitch_channels.forEach(e=>{
			const el=e[1]
			const stream=streams.find(s=>s.user_login===e[0])
			if(stream){
				const els=el.children
				el.classList.toggle("hide",false)
				el.title			=stream.title
				el.dataset.id		=stream.user_login
				els[0].innerText	=stream.viewer_count
				els[1].innerText	=stream.user_name
				els[1].href			="https://www.twitch.tv/"+stream.user_login
				els[2].innerText	=stream.game_name
				els[2].href			="https://www.twitch.tv/directory/game/"+stream.game_name
			}else
				el.classList.toggle("hide",true)
		})
		//	se podría ordenar por número de espectadores
	}

	static build_stream_block(platform){
		const line=document.createElement("div")
		const viewers=document.createElement("div")
		const user=document.createElement("a")
		const c=document.createElement("a")

		line.className="hide line "+platform
		viewers.className="viewers"
		user.className="channel"
		user.target="_blank"
		c.target="_blank"

		line.append(viewers)
		line.append(user)
		line.append(c)
		streamlist.append(line)
		return line
	}
}