class Lang{
	static prefix;
	static langs=[
		{
			"id":"es",
			"title":"Español",
			"icon":"🇪🇸"
		},
		{
			"id":"en",
			"title":"English",
			"icon":"🇬🇧"
		}
	];
	static defaultLang="es";
	static current;
	static options;
	static data;

	static start(lang,prefix="./assets/default/langs/"){
		if(!lang || !this.langs.find(e=>e.id===lang))
			lang=this.getDefaultLang();
		this.prefix=prefix;
		this.loadFile(lang);
	}

	static getDefaultLang(){
		if(!navigator && !navigator.language)
			return this.defaultLang;
		const bl=navigator.language.split("-")[0];
		const l=this.langs.find(e=>e.id===bl);
		return  l?l.id:this.defaultLang;
	}

	static load(lang){
		if(this.current && lang===this.current)
			return;
		this.loadFile(lang);
		ConfigManager.save();
	}

	static loadFile(lang){
		fetch(this.prefix + lang+".json",{cache:"force-cache"}).then(e=>e.text()).then(e=>JSON.parse(e)).then(data=>{
			this.current=lang;
			this.options=data.options;
			this.data	=data.data;
			this.update();
		})
	}

	static get(key){
		if(!this.current)	// Aquí un fallo, se piden valores antes de cargar las traducciones
			return key;
		if(this.data && this.data[key])
			return this.data[key];
		console.log("["+this.current+"]","Lang value not found",key);
		return key;
	}

	static set_text(e,key){
		e.dataset.lang_text=key;
		e.innerHTML=this.get(key);
	}

	static set_value(e,key){
		e.dataset.lang_value=key;
		e.value=this.get(key);
	}

	static set_title(e,key){
		e.dataset.lang_title=key;
		e.title=this.get(key);
	}

	static set_placeholder(e,key){
		e.dataset.lang_placeholder=key;
		e.placeholder=this.get(key);
	}

	static update(){
		document.dir=this.options.dir;
		document.querySelectorAll("[data-lang_text]").forEach(e=>{e.innerHTML			=this.get(e.dataset.lang_text)});
		document.querySelectorAll("[data-lang_value]").forEach(e=>{e.value				=this.get(e.dataset.lang_value)});
		document.querySelectorAll("[data-lang_title]").forEach(e=>{e.title				=this.get(e.dataset.lang_title)});
		document.querySelectorAll("[data-lang_placeholder]").forEach(e=>{e.placeholder	=this.get(e.dataset.lang_placeholder)});
		Events.dispatch('config.lang');
	}
}