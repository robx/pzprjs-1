// Menu.js v3.4.0

//---------------------------------------------------------------------------
// ★Menuクラス [ファイル]等のメニューの動作を設定する
//---------------------------------------------------------------------------

// メニュー描画/取得/html表示系
// Menuクラス
ui.menu = {
	menupid : '',				// どの種類のパズルのメニューを表示しているか
	menuconfig : {},			// MenuConfigの設定内容を保持する
	
	enableSaveImage : false,	// 画像保存(png形式)が可能か
	enableSaveSVG   : false,	// 画像保存(SVG形式)が可能か
	enableGetText   : false,	// FileReader APIの旧仕様でファイルが読めるか
	enableReadText  : false,	// HTML5 FileReader APIでファイルが読めるか
	enableSaveBlob  : false,	// saveBlobが使用できるか
	
	reader : null,				// FileReaderオブジェクト
	
	//---------------------------------------------------------------------------
	// menu.init()   初回起動時の初期化関数
	//---------------------------------------------------------------------------
	init : function(){
		this.initMenuConfig();
		
		this.initReader();

		if(pzpr.env.browser.IE6){
			this.modifyCSS('menu.floatmenu li.smenusep', {lineHeight :'2pt', display:'inline'});
		}
		
		window.navigator.saveBlob = window.navigator.saveBlob || window.navigator.msSaveBlob;
		this.enableSaveBlob = (!!window.navigator.saveBlob);
		
		this.fileio = (_doc.domain==='indi.s58.xrea.com'?"fileio.xcg":"fileio.cgi");
	},
	
	//---------------------------------------------------------------------------
	// menu.menuinit()   メニュー、サブメニュー、フロートメニュー、ボタン、
	//                   管理領域、ポップアップメニューの初期設定を行う
	// menu.menureset()  メニュー用の設定を消去する
	//---------------------------------------------------------------------------
	menuinit : function(){
		var pid = ui.puzzle.pid;
		
		if(ui.menu.menupid === pid){ return;}	/* パズルの種類が同じなら初期設定必要なし */
		
		if(!!ui.puzzle.imgcanvas[0] && !!_doc.createElement('canvas').toDataURL){
			this.enableSaveImage = true;
		}
		if(!!ui.puzzle.imgcanvas[1] && !!window.btoa){
			this.enableSaveSVG = true;
		}
		
		this.menureset();

		ui.keypopup.create();

		if(!!ui.menuarea){ ui.menuarea.init();}
		if(!!ui.toolarea){ ui.toolarea.init();}

		this.settextsize();
		this.displayAll();

		ui.event.setUIEvents();				/* イベントをくっつける */

		this.menupid = pid;
	},

	menureset : function(){
		if(!!ui.menuarea){ ui.menuarea.reset();}
		if(!!ui.toolarea){ ui.toolarea.reset();}

		ui.keypopup.clear();
		if(!!ui.popupmgr){ ui.popupmgr.reset();}
		
		ui.event.removeUIEvents();
	},

	//---------------------------------------------------------------------------
	// initReader() File Reader (あれば)の初期化処理
	//---------------------------------------------------------------------------
	initReader : function(){
		if(typeof FileReader == 'undefined'){
			this.reader = null;

			if(typeof FileList != 'undefined' &&
			   typeof File.prototype.getAsText != 'undefined')
			{
				this.enableGetText = true;
			}
		}
		else{
			this.reader = new FileReader();
			this.reader.onload = function(e){
				ui.puzzle.open(e.target.result);
			};
		}
	},

	//---------------------------------------------------------------------------
	// menu.displayAll()     全てのメニュー、ボタン、ラベルに対して文字列を設定する
	// menu.setdisplay()     個別のメニュー、ボタン、ラベルに対して文字列を設定する
	// menu.displayDesign()  背景画像とかtitle・背景画像・html表示の設定
	// menu.bgimage()        背景画像を返す
	//---------------------------------------------------------------------------
	displayAll : function(){
		ui.menuarea.display();
		ui.toolarea.display();
		ui.popupmgr.translate();

		this.displayDesign();
	},
	setdisplay : function(idname){
		ui.menuarea.setdisplay(idname);
		ui.toolarea.setdisplay(idname);
	},

	displayDesign : function(){
		var pid = ui.puzzle.pid;
		var pinfo = pzpr.url.info[pid];
		var title = this.selectStr(pinfo.ja, pinfo.en);
		if(pzpr.EDITOR){ title += this.selectStr(" エディタ - ぱずぷれv3"," editor - PUZ-PRE v3");}
		else		   { title += this.selectStr(" player - ぱずぷれv3"  ," player - PUZ-PRE v3");}

		_doc.title = title;
		var titleEL = _doc.getElementById('title2');
		titleEL.innerHTML = title;

		var imageurl = this.bgimage(pid);
		if(!imageurl){ imageurl="./bg/"+pid+".gif";}
		_doc.body.style.backgroundImage = "url("+imageurl+")";
		if(pzpr.env.browser.IE6){
			titleEL.style.marginTop = "24px";
		}
	},
	bgimage : function(pid){
		return toBGimage(pid);
	},

	//---------------------------------------------------------------------------
	// menu.enb_undo()     html上の[戻][進]ボタンを押すことが可能か設定する
	//---------------------------------------------------------------------------
	enb_undo : function(){
		ui.menuarea.enb_undo();
		ui.toolarea.enb_undo();
	},

	//---------------------------------------------------------------------------
	// menu.setConfigVal()   値設定の共通処理
	// menu.getConfigVal()   値設定の共通処理
	//---------------------------------------------------------------------------
	setConfigVal : function(idname, newval){
		if(!!this.menuconfig[idname]){
			this.setMenuConfig(idname, newval);
		}
		else if(!!ui.puzzle.config.list[idname]){
			ui.puzzle.setConfig(idname, newval);
		}
		else if(idname==='uramashu'){
			ui.puzzle.board.uramashu = newval;
			ui.event.config_common(ui.puzzle, idname, newval);
		}
		else if(idname==='mode'){
			ui.puzzle.modechange(newval);
		}
	},
	getConfigVal : function(idname){
		if(!!this.menuconfig[idname]){
			return this.getMenuConfig(idname);
		}
		else if(!!ui.puzzle.config.list[idname]){
			return ui.puzzle.getConfig(idname);
		}
		else if(idname==='uramashu'){
			return ui.puzzle.board.uramashu;
		}
		else if(idname==='mode'){
			return ui.puzzle.playmode ? 3 : 1;
		}
	},

	//---------------------------------------------------------------------------
	// menu.initMenuConfig()  盤面下のボタンエリアの初期化を行う
	// menu.setMenuConfig()   アイスと○などの表示切り替え時の処理を行う
	// menu.getMenuConfig()   html上の[戻][進]ボタンを押すことが可能か設定する
	//---------------------------------------------------------------------------
	initMenuConfig : function(){
		this.menuconfig = {};

		/* 正解自動判定機能 */
		this.menuconfig.autocheck = {val:pzpr.PLAYER};

		/* キーポップアップ (数字などのパネル入力) */
		this.menuconfig.keypopup = {val:false};

		/* 自動横幅調節 */
		this.menuconfig.adjsize = {val:true};

		/* 表示サイズ */
		this.menuconfig.cellsize = {val:2, option:[0,1,2,3,4]};

		/* セルのサイズ設定用 */
		this.menuconfig.cellsizeval = {val:36};

		/* キャンバスを横幅いっぱいに広げる */
		this.menuconfig.fullwidth = {val:(ui.event.windowWidth()<600)};
	},
	setMenuConfig : function(idname, newval){
		if(!this.menuconfig[idname]){ return;}
		this.menuconfig[idname].val = newval;
		this.setdisplay(idname);
		switch(idname){
		case 'keypopup':
			ui.keypopup.display();
			break;
			
		case 'adjsize': case 'cellsize': case 'fullwidth':
			ui.event.adjustcellsize();
			break;
		}
	},
	getMenuConfig : function(idname){
		return (!!this.menuconfig[idname]?this.menuconfig[idname].val:null);
	},

	//---------------------------------------------------------------------------
	// menu.saveMenuConfig()     全フラグの設定値を返す
	// menu.restoreMenuConfig()  全フラグの設定値を設定する
	//---------------------------------------------------------------------------
	saveMenuConfig : function(){
		var object = {};
		for(var key in this.menuconfig){ object[key] = this.menuconfig[key].val;}
		delete object.autocheck;
		return JSON.stringify(object);
	},
	restoreMenuConfig : function(json){
		var object = JSON.parse(json);
		for(var key in this.menuconfig){
			if(object[key]!==void 0){ this.menuconfig[key].val = object[key];}
		}
	},

//--------------------------------------------------------------------------------------------------------------

	//--------------------------------------------------------------------------------
	// menu.settextsize() テキストのサイズを設定する
	// menu.modifyCSS()   スタイルシートの中身を変更する
	//--------------------------------------------------------------------------------
	settextsize : function(num){
		this.modifyCSS({'.outofboard':{
			fontSize:['1.0em','1.5em','2.0em','3.0em'][num],
			lineHeight:['1.2','1.1','1.1','1.1'][num]
		} });
	},
	modifyCSS : function(input){
		var sheet = _doc.styleSheets[0];
		var rules = (!!sheet.cssRules ? sheet.cssRules : sheet.rules);
		if(!rules){ return;} /* Chrome6の挙動がおかしいのでエラー回避用 */
		var modified = this.modifyCSS_sub(rules, input);
		if(!modified){
			var sel = ''; for(sel in input){ break;}
			if(!!sheet.insertRule){ sheet.insertRule(""+sel+" {}", rules.length);}
			rules = (!!sheet.cssRules ? sheet.cssRules : sheet.rules);
			this.modifyCSS_sub(rules, input);
		}
	},
	modifyCSS_sub : function(rules, input){
		var modified = false;
		for(var i=0,len=rules.length;i<len;i++){
			var rule = rules[i];
			if(!rule.selectorText){ continue;}
			var pps = input[rule.selectorText];
			if(!!pps){
				for(var p in pps){ if(!!pps[p]){ rule.style[p]=pps[p];}}
				modified = true;
			}
		}
		return modified;
	},

//--------------------------------------------------------------------------------------------------------------

	//--------------------------------------------------------------------------------
	// menu.selectStr()  現在の言語に応じた文字列を返す
	// menu.alertStr()   現在の言語に応じたダイアログを表示する
	// menu.confirmStr() 現在の言語に応じた選択ダイアログを表示し、結果を返す
	//--------------------------------------------------------------------------------
	selectStr : function(strJP, strEN){
		return (ui.puzzle.getConfig('language')==='ja' ? strJP : strEN);
	},
	alertStr : function(strJP, strEN){
		alert(ui.puzzle.getConfig('language')==='ja' ? strJP : strEN);
	},
	confirmStr : function(strJP, strEN){
		return confirm(ui.puzzle.getConfig('language')==='ja' ? strJP : strEN);
	},
	promptStr : function(strJP, strEN, initialStr){
		return prompt(ui.puzzle.getConfig('language')==='ja' ? strJP : strEN, initialStr);
	},

//--------------------------------------------------------------------------------------------------------------

	//------------------------------------------------------------------------------
	// menu.duplicate() 盤面の複製を行う => 受取はBoot.jsのimportFileData()
	//------------------------------------------------------------------------------
	duplicate : function(){
		var filestr = ui.puzzle.getFileData(pzpr.consts.FILE_PZPH);
		var url = './p.html?'+ui.puzzle.pid+(pzpr.PLAYER?"_play":"");
		if(!pzpr.env.browser.Presto){
			var old = sessionStorage['filedata'];
			sessionStorage['filedata'] = filestr;
			window.open(url,'');
			if(!!old){ sessionStorage['filedata'] = old;}
			else     { delete sessionStorage['filedata'];}
		}
		else{
			localStorage['pzprv3_filedata'] = filestr;
			window.open(url,'');
		}
	},

	//------------------------------------------------------------------------------
	// menu.answercheck()「正答判定」ボタンを押したときの処理
	// menu.ACconfirm()  「回答消去」ボタンを押したときの処理
	// menu.ASconfirm()  「補助消去」ボタンを押したときの処理
	//------------------------------------------------------------------------------
	answercheck : function(){
		alert( ui.puzzle.check(true).text() );
	},
	ACconfirm : function(){
		if(this.confirmStr("回答を消去しますか？","Do you want to erase the Answer?")){
			ui.puzzle.ansclear();
		}
	},
	ASconfirm : function(){
		if(this.confirmStr("補助記号を消去しますか？","Do you want to erase the auxiliary marks?")){
			ui.puzzle.subclear();
		}
	}
};

function toBGimage(pid){
	var header;
	var data = {
	/* カラーパレットが2色時のHeader(途中まで), 16×16サイズのData Block(途中から) */
	aho       :['ICAgKCgoC','I4Qdp3vJDxwMtNorV85sQ6RwWhhiZPNF57Q+3udgcjWmLVMAADs='],
	amibo     :['P/AwP///y','HoRjqQvI36AKtNrrolx5Hz+BXjeKX4KlVWmSmyt1BQA7'],
	ayeheya   :['P/ow////y','F4SPGJEN66KctNoGaZ5b9guGIsdoZVUAADs='],
	bag       :['P+vg///wC','JYRjl4DbmlqYtNr3mFs67g+FYiZd5uSlYjdyJNim56mytv3CeQEAOw=='],
	barns     :['MDAwID//y','JQyCqZa369hTDtg7cYxT+r51zUVyWSMiYbqKJZl65tOCqDHjZQEAOw=='],
	bdblock   :['Dn/pP///y','IoyPqQHb+lJE81RzmdsMeI994EKWJsVJKQqtlouFovydSgEAOw=='],
	bonsan    :['P//wMD/wC','JoSPicGqcWCSgBpbJWa81zlR4hNizomeHMh+1wZ2MtssrTmmmVQAADs='],
	box       :['ICAgKCgoC','IgyOCaadxpyKEkHqKH5tLxmEondg5MeBU2WyKziGakfPRwEAOw=='],
	cbblock   :['P/QQf///y','H4wDp3vJj+BzUlEIst784rp4lSiRH9igKdNpk2qYRwEAOw=='],
	chocona   :['P/AwP///y','IIyPGcDtD1BUM1WpVr6HG69R2yiWFnmamNqh0Ntk8iwXADs='],
	cojun     :['MD//////y','I4wfgMvKD+Jrcp6IrcF18ux9DiWOSNldaJqspgu28AZndVYAADs='],
	country   :['P/Gif///y','IISPGZFtDKB7SDZL78RYna6BjhhO1WdG3siubWZC5FkAADs='],
	creek     :['AD//8H+/y','JIQfGces2tyD8RkrU16XboBVExd1YTmSjXWa5NlirTsjU/k1BQA7'],
	factors   :['AD//////y','IISPqcsWHxp4iKq4cGXayd5dWwN+SXigqHeBawpJ8pwUADs='],
	fillmat   :['P//wLP/gS','JoSDAam2yh6SM9pbE4UaT3d0HrWRmDOiXMZ+oLfG5cjIMAnOIlsAADs='],
	fillomino :['ODg4P///y','I4QPgcvKn4KU0DhbE7qP3wl608FtDVRq3bkuYZillYxmLlQAADs='],
	firefly   :['ID/gP//wC','JISDpqvRzNySME2EMaAHzuddXEiWlVVSYxRl7riCsqeaG2orBQA7'],
	fivecells :['MD/wP///y','IwyOmWbqDaCLCgY7T5NT8vV02fdpYpVRSAmqZ4S145rS7FMAADs='],
	fourcells :['MD/wP///y','JoSPELeZrdxjoUJbmTYQ3T1xoEdh1gh+jhqtaZlxGOqK0nvL5o4VADs='],
	goishi    :['P/zwf///y','JoSPiRHK2UA0cU5JVz5V79stFzUq5oly5eOBG8a9sAu/4QetZXoUADs='],
	gokigen   :['OD/g////y','HYQPgafbvlKUMD42r9HbZg9W4oh9IdmZaLpSLZcUADs='],
	hakoiri   :['MD//////y','KISPicEa+UyUYE5KLcSVY81FVyc1JYMq6oKm6zgu2zur8Eoesd6aSgEAOw=='],
	hanare    :['AD//////y','FYSPqcvtDyMMdNLqLm46WC+F4kgmBQA7'],
	hashikake :['P///8DAwC','JoQflse829qLMlhLVYQuw8s5F+JtpTJSIKm2UgaAGBxrdI3TU1MAADs='],
	heyabon   :['P//wMD/wC','LYyPacDtH9p5LgJ7IYt4V559Clh9Idad0kJ57caimmex7nqNUN2lti8JvSaAAgA7'],
	heyawake  :['MD/wP///y','F4SPGJEN66KctNoGaZ5b9guGIsdoZVUAADs='],
	hitori    :['P//QP///y','H4SPFhvpwNpDcVJ2lz11Q+x1HgduonVOZ/qwjpvASAEAOw=='],
	icebarn   :['EH9/////y','F4SPqcvt3wJEcpp6g95cW/yAjmiV5nkWADs='],
	icelom    :['EH9/////y','GYSPqcvdAYOblMl1UU7b9PN9XkWSkVimaQEAOw=='],
	icelom2   :['H///////y','G4SPqcvNEQxsMVX71MWue7SBWjZyywSg38o2BQA7'],
	ichimaga  :['ODg4P///y','IIyPGcDtfZ4EUdmLzWRxQ+1kovh0HgVO42qhy+nCHBsUADs='],
	ichimagam :['ODg4P///y','F4yPGcDtD6NTtFojs3639w1m3kiW5lUAADs='],
	ichimagax :['ODg4P///y','HkSOicDtDyNUtNHKltzcXXsloNKVm2aEqHqYbsQuBQA7'],
	kaero     :['P/A/////y','KIyPecDtbUB4dE5JIbtSxa1VISaC5sOlmXo6LImOnCt77BxjuPhlbgEAOw=='],
	kakuro    :['ICAgP///y','F4SPqcut4V5McJ5qAbZ79vg5YTNmZlYAADs='],
	kakuru    :['MD/wP///y','HYSPqcut4QA8c1Vq2ZWu7vxpERYmXmeKz6oaJVUAADs='],
	kinkonkan :['P//gP///y','JoSDAanmrKBbsDaL7ctoUuwdjBhSWxdyHod+bObCZyetiVuOo1MAADs='],
	kouchoku  :['ODg4P///y','IIwDp3vJbxxccqraMKK6xX4BYDh+0SRSTLparevBsVwVADs='],
	kramma    :['ID/gMD/wC','IISPGJFt6xqMitEzL8hv+Q+G4idZGkehkeqwpdbBj7wVADs='],
	kramman   :['ID/gMD/wC','GYSPqcvtj4IMb85mbcy8+7xxGOho0ImmaQEAOw=='],
	kurochute :['PDw8ODg4C','IYSPFpGty9yBUD5qb9QVrER1GTaSUvWdadqILCKW2UzTBQA7'],
	kurodoko  :['ICAgMDAwC','H4SPiRHqDaAzMk66Lraa1g6GIhNCn1Kd2aGubUKKSAEAOw=='],
	kurotto   :['MDAwODg4C','KYxvoKuIzNKSD8gWMM2T12t5h+ZAncOZaoiu6LZFYtyRmGyHuPqmUF8AADs='],
	kusabi    :['MD/wP///y','I4SPqZvh/06QaxoLMMK80uuBYvaRY3eWW6mxqjuuJwQx9r0UADs='],
	lightup   :['MD//////y','IIRvgcvKDxycNAY5r6a6I99t2xdijVeN1bqYHJvA0VMAADs='],
	lits      :['ICAgKCgoC','IYQRqXmNq9yBUT7alr1wU2Z9gfeRWFiip6RNKfs6otkdBQA7'],
	lookair   :['AD//6D//y','GoSPqcsa/5qBUdIgwc07+w92jciQi+lQYFYAADs='],
	loopsp    :['P+AgP/Pgy','KYwPeLtpzoCcVDb1Mg7QQb55T9VVGrOBaPqhHomY6iyG2EfCa7dep1EAADs='],
	loute     :['IH/gf///y','IYyPaaDB+lJE89TVrssZ+Ph5zUiWG8ShqpSyK9V9Vmg2BQA7'],
	mashu     :['P/AwP///y','JoR/kRntvYxCFExb6b0ZS/Y4kdeRXLaVViqFJ1vCndw+oziP+QcUADs='],
	mejilink  :['NDQ0P///y','JoxheZrI4VhUE9iLc5ztQc8tz9ZBpPiN4Kq2hwZbpcTS7lk1zlYAADs='],
	minarism  :['AD//4H+/y','HYyPqcutAKN8DNBlU75oa/6FoOF141EG0po67vsWADs='],
	mochikoro :['AAAAICAgC','IYwDqXmNq9yBUT7alr1wU2Z9gPeRWFiip6RNKfs6otkdBQA7'],
	mochinyoro:['MDAwKCgoC','FoSPqct9AaOctNqLs4au+29s4kiWUwEAOw=='],
	nagenawa  :['ACAgACeoC','JYSPacHdCgKUiiaL8NFrO7eF3RiJJWml5geS2QRX8TWxDITnegEAOw=='],
	nanro     :['MD//+H//y','IIQfGcet2+KLUlFnL8rs+Q+G4khOWKJtaAqYqavBlwwUADs='],
	nawabari  :['MD//////y','IwRihsnK2xI88dnqJM68zhl9G6V5wYmmagc24vZisavWKYsVADs='],
	norinori  :['P/d1MDAwC','I4QfGcet2+KLUlFn8USvJ+Z5YLgZogZdZqYCpfpeMTVXX1MAADs='],
	numlin    :['MDAwP///y','JYyBaJG6Cx6UhzIbacuszaphYkhKG+SVD7eOJpZ2yXepdGuDRgEAOw=='],
	nuribou   :['KCgoICAgC','JYQRGYfKug58TlYzbaJbR3w1HTiKn8mdGamGK+ql6Uu7dlnjYQEAOw=='],
	nurikabe  :['P+hof/R0S','FoSPqcvtD1eY1NHa7rSaX49F4kiWTAEAOw=='],
	paintarea :['P//wMD/wC','JowDCYfKug58TlYzbaJbR3w1HTiKn8lBZ5oxpOp6rTurIXvL+TsXADs='],
	pipelink  :['ID/gM//gy','Kkxgqae4bYCcjs6YaoaY9a99BxWRz4mmi1VeW+d44Px6cWXhrHzG/OMoAAA7'],
	pipelinkr :['ID//8D//y','Kkxgqae4bYCcjs6YaoaY9a99BxWRz4mmi1VeW+d44Px6cWXhrHzG/OMoAAA7'],
	reflect   :['MDAwP///y','HoyPqcvtCMAzMb5aWw5YbfpxVtKJEoONWrhO7gsnBQA7'],
	renban    :['ID/gP//wC','JoRjeZrI4FhUM9h7F4yzPfh1mkRp2MmF6iOCLIVaZvrWpF16bnwVADs='],
	ringring  :['KCgoMDAwC','JwRiqae4bYKctDr3Isw63dp1VsgcYCmeWDmirLpx6/p81n1xJL04BQA7'],
	ripple    :['AD//////y','IIyBYJG6jRg8sNqLs97RyvZMnxNGo3liKce2XkuBVVAAADs='],
	roma      :['P/wwf///y','IoSPqXvBGtxrcZpYJ85sc+hJYLiE2Ggm5oas7OWeQMzSWwEAOw=='],
	sashigane :['IH/gf///y','HYyPqcsBrcBrskp4LjZz+79p2NQxZRkhaOp4IhgUADs='],
	shakashaka:['AAAAICAgC','IoSPqRe7AR2CVAKKHd5q++l9VxgaJMecTXJqoltZ4ypfSwEAOw=='],
	shikaku   :['ICAgMDAwC','HoSPGcm43YKctMoIcVab9/N8QPiRjoVe4riyq7kFBQA7'],
	shimaguni :['P//wMD/wC','G4yPqavgDx2KFMwKL5as+w+GBqVtJXZWqcgeBQA7'],
	shugaku   :['AAAQAAAgC','JoRvoauIzNyBSyYaXp37Nv55GTiKGnWWQESmbguLrISp6ezUFlAAADs='],
	shwolf    :['ID/gMD/wC','IQyOiQas6RqcytlXsY569RaE4vhx5Zedx5WulKuamNwFBQA7'],
	slalom    :['ID//////y','IIwPecsJDIOLcNJlr3FP76yBF+d9SkmipydSbbWOsVEAADs='],
	slither   :['AAAAP///y','F4yPqcutAF5MULqLs978Vjohnxh2ZlYAADs='],
	snakes    :['ID/gMD/wC','FISPqcvtD1WYtM6Is96825pcHVQAADs='],
	sudoku    :['P//wP///y','HoRvgcvKDxxccp5qY0bY9hiE4khCn7ldabJq6/l8BQA7'],
	sukoro    :['MDAwODg4C','JYyPoMin39KDMUwa76p2crd9HGaQF0hpQHeqrOe671p6KEOKSAEAOw=='],
	tasquare  :['ICAgGBgYC','IYxvoKuIzNyBSyYKbMDZcv15HPaMzWR2l1mmFcrCYzsfBQA7'],
	tatamibari:['LP/gf///y','HYSPqaHA2x6SM9pETzbbwY9dFTiG5lmmzcq2rlIAADs='],
	tateyoko  :['P/AwP///y','H4RjqQvI3+BzJ9hLqUx6R8+BXreRkoZhofiJJvROSgEAOw=='],
	tawa      :['MDAwODg4C','GIR/gcud3hRccj57Mai6+8lZIeiNkOlwBQA7'],
	tentaisho :['IWL/X23/y','KASCYcum+5qDUx6mYtPZ3u19VZhooVWeBzJK5WNCr7jNsfOyXq6mQAEAOw=='],
	tilepaint :['KCgoICAgC','JowDCYfKug58TlYzbaJbR3w1HTiKn8lBZ5oxpOp6rTurIXvL+TsXADs='],
	toichika  :['ID/gP///y','IoSPqRvsGlqSJlp6adXAwreE4nhwooeYWWlW6ZpObfeRYQEAOw=='],
	triplace  :['MD/wP///y','JgyOCXas6dxrKNiLb51xv0593lJhI6ig0jlCZQabEzuHZH0v8V4AADs='],
	usotatami :['MD/wP//wC','KIQTppqcvc6BMKIKsIuZN10hjDdZnkguKNeV2ri+pQquKi2l9nulQAEAOw=='],
	wagiri    :['P/rw////y','IIQPEci42dgzs1Ua77na7ShBoNR1YpilKmqtrOd+MVUAADs='],
	yajikazu  :['P/B/f///y','HoSPEMm5DZ8JtNoKmcyTo+1loBh25YVSX3mMnMsyBQA7'],
	yajirin   :['MD/wP///y','HISDicas2tpL0c1Qs968nwuGl0eWHqihmVqxRgEAOw=='],
	yajitatami:['MD/wP//wC','J4wPeRvpj9SbwLhG4WV8aZkpWBVWFkh1HHSSZTuGY7ypXYnSE/y2BQA7'],
	yosenabe  :['ODg/////y','JIwDd6nGjdqD0VFZr5qg+4ltGgiKJkWO4bJ8nVhCT8yeq20dBQA7'],

	/* カラーパレットが3-4色時のHeader(途中まで), 16×16サイズのData Block(途中から) */
	bosanowa  :['P/AwP/hw////////y','LowtAst5l1gTL6Q4r968e5VR0CUBToVJ55NOlQWqIhsvGv3l+j22/FgyzYAlRwEAOw=='],
	sukororoom:['NDQ0ODg4PDw8P///y','NIwfgqebBqJpS8X7nL0g18B1FNJgHukkwsqu6ZiioISYmzljN51LewfhZHBBICw2aSmXggIAOw=='],
	view      :['MD/wP//wP///////y','LoQtEst5l1gTDykZXNq8+99hThWJFHlJ41OqJ5tOFdDKaAbmOnebc71YQWJBSgEAOw=='],
	wblink    :['NDQ0ODg4Pj4+P///y','LoQdIct5l1gLDykpXNq8+99hThWJFHlJ41OqJ5tOFdDKaAbmOnebc71YQWJBSgEAOw==']
	}[pid];

	/* 無い場合はimage.gifを返します */
	if(!data){ data=['MD/wPD/8C','KYQTpogKnFxbMDpa7W18yjhp1yGO1OidW5mSKFuaTyy585t0ctZ+EFAAADs='];}

	if(data[0].length<=10){ header='R0lGODdhEAAQAIAAA';}
	else                  { header='R0lGODdhEAAQAKEAA';}

	return "data:image/gif;base64,"+header+data[0]+'wAAAAAEAAQAAAC'+data[1];
};