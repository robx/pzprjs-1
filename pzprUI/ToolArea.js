// ToolArea.js v3.4.0
(function(){

/* uiオブジェクト生成待ち */
if(!window.ui){ setTimeout(setTimeout(arguments.callee),15); return;}

var k = pzprv3.consts;

// メニュー描画/取得/html表示系
// toolareaオブジェクト
/* extern */
ui.toolarea = {

	isdisp : true,		// 表示しているか

	//---------------------------------------------------------------------------
	// toolarea.init()   管理領域の初期設定を行う
	// toolarea.reset()  管理領域用の設定を消去する
	//---------------------------------------------------------------------------
	init : function(){
		this.createArea();
		this.createButtonArea();
	},

	reset : function(){
		this.btnstack   = [];

		getEL('usepanel')  .innerHTML = '';
		getEL('checkpanel').innerHTML = '';

		if(!!this.area){ this.area.innerHTML = '';}
	},

	//---------------------------------------------------------------------------
	// toolarea.addButtons() ボタンの情報を変数に登録する
	//---------------------------------------------------------------------------
	addButtons : function(el, strJP, strEN){
		ui.event.addEvent(el, "click", this, this.buttonclick);
		pzprv3.unselectable(el);
		this.btnstack.push({el:el, str:{ja:strJP, en:strEN}});
	},

	//---------------------------------------------------------------------------
	// toolarea.createArea()  管理領域を初期化する
	//---------------------------------------------------------------------------
	createArea : function(){
		// ElementTemplate : 管理領域
		var el_div = pzprv3.createEL('div');

		var el_span = pzprv3.createEL('span');
		pzprv3.unselectable(el_span);

		var el_checkbox = pzprv3.createEL('input');
		el_checkbox.type = 'checkbox';
		el_checkbox.check = '';

		var el_selchild = pzprv3.createEL('div');
		el_selchild.className = 'flag';
		pzprv3.unselectable(el_selchild);

		// usearea & checkarea
		var pp = ui.menuarea.items;
		for(var idname in pp.item){
			if(!pp.getLabel(idname)){ continue;}
			var _div = el_div.cloneNode(false);
			_div.id = 'div_'+idname;

			switch(pp.type(idname)){
			case pp.SELECT:
				var span = el_span.cloneNode(false);
				span.id = 'cl_'+idname;
				_div.appendChild(span);
				_div.appendChild(document.createTextNode(" | "));
				for(var i=0;i<pp.item[idname].children.length;i++){
					var num = pp.item[idname].children[i];
					var sel = el_selchild.cloneNode(false);
					sel.id = ['up',idname,num].join("_");
					ui.event.addEvent(sel, "click", this, this.selectclick);
					_div.appendChild(sel);
					_div.appendChild(document.createTextNode(' '));
				}
				_div.appendChild(document.createElement('br'));

				getEL('usepanel').appendChild(_div);
				break;

			case pp.CHECK:
				var box = el_checkbox.cloneNode(false);
				box.id = 'ck_'+idname;
				ui.event.addEvent(box, "click", this, this.checkclick);
				_div.appendChild(box);
				_div.appendChild(document.createTextNode(" "));
				var span = el_span.cloneNode(false);
				span.id = 'cl_'+idname;
				_div.appendChild(span);
				_div.appendChild(document.createElement('br'));

				getEL('checkpanel').appendChild(_div);
				break;
			}
		}

		// 色分けチェックボックス用の処理
		if(ui.puzzle.flags.irowake){
			// 横にくっつけたいボタンを追加
			var el = createButton();
			el.id = "ck_btn_irowake";
			this.addButtons(el, "色分けしなおす", "Change the color of Line");
			var node = getEL('cl_irowake');
			node.parentNode.insertBefore(el, node.nextSibling);

			// 色分けのやつを一番下に持ってくる
			var el = getEL('checkpanel').removeChild(getEL('div_irowake'));
			getEL('checkpanel').appendChild(el);
		}

		// 管理領域の表示/非表示設定
		if(pzprv3.EDITOR){
			getEL('timerpanel').style.display = 'none';
			getEL('separator2').style.display = 'none';
		}
	},

	//---------------------------------------------------------------------------
	// toolarea.createButtonArea()   ボタン用の初期設定を行う
	//---------------------------------------------------------------------------
	createButtonArea : function(){
		this.area = pzprv3.getEL('btnarea');

		// (Canvas下) ボタンの初期設定
		var btncheck = createButton(); btncheck.id = "btncheck";
		var btnundo  = createButton(); btnundo.id  = "btnundo";
		var btnredo  = createButton(); btnredo.id  = "btnredo";
		var btnclear = createButton(); btnclear.id = "btnclear";

		this.area.appendChild(btncheck);
		this.area.appendChild(document.createTextNode(' '));
		this.area.appendChild(btnundo);
		this.area.appendChild(btnredo);
		this.area.appendChild(document.createTextNode(' '));
		this.area.appendChild(btnclear);

		this.addButtons(btncheck, "チェック", "Check");
		this.addButtons(btnundo,  "戻", "<-");
		this.addButtons(btnredo,  "進", "->");
		this.addButtons(btnclear, "回答消去", "Erase Answer");

		// 初期値ではどっちも押せない
		getEL('btnundo').disabled = true;
		getEL('btnredo').disabled = true;

		if(!ui.puzzle.flags.disable_subclear){
			var el = createButton(); el.id = "btnclear2";
			this.area.appendChild(el);
			this.addButtons(el, "補助消去", "Erase Auxiliary Marks");
		}

		if(!!ui.puzzle.flags.irowake){
			var el = createButton(); el.id = "btncolor2";
			this.area.appendChild(el);
			this.addButtons(el, "色分けしなおす", "Change the color of Line");
			el.style.display = 'none';
		}

		if(ui.puzzle.pid==='pipelinkr'){
			var el = createButton(); el.id = 'btncircle';
			pzprv3.unselectable(el);
			ui.event.addEvent(el, "click", this, this.toggledisp);
			this.area.appendChild(el);
		}

		if(ui.puzzle.pid==='tentaisho'){
			var el = createButton(); el.id = 'btncolor';
			this.area.appendChild(el);
			this.addButtons(el, "色をつける","Color up");
		}
	},

	//---------------------------------------------------------------------------
	// toolarea.display()    全てのラベルに対して文字列を設定する
	// toolarea.setdisplay() 管理パネルに表示する文字列を個別に設定する
	//---------------------------------------------------------------------------
	display : function(){
		for(var i in ui.menuarea.items.item){
			this.setdisplay(i);
		}
		for(var i=0,len=this.btnstack.length;i<len;i++){
			var obj = this.btnstack[i];
			if(!obj.el){ continue;}
			obj.el.value = obj.str[ui.menu.getMenuConfig('language')];
		}
		this.enb_undo();
		
		var mandisp  = (this.isdisp ? 'block' : 'none');
		getEL('usepanel').style.display = mandisp;
		getEL('checkpanel').style.display = mandisp;
		if(!pzprv3.EDITOR){
			getEL('separator2').style.display = mandisp;
		}
		if(ui.puzzle.flags.irowake){
			/* ボタンエリアのボタンは、管理領域が消えている時に表示 */
			getEL('btncolor2').style.display = (this.isdisp ? 'none' : 'inline');
		}
		getEL('menuboard').style.paddingBottom = (this.isdisp ? '8pt' : '0pt');
		
		if(pzprv3.browser.IE6){
			getEL('separator2').style.margin = '0pt';
		}
	},
	setdisplay : function(idname){
		var pp = ui.menuarea.items;
		if(!pp || !pp.item[idname]){ return;}
		
		switch(pp.type(idname)){
		case pp.SELECT:
			var label = getEL('cl_'+idname);
			if(!!label){ label.innerHTML = pp.getLabel(idname);}
			
			/* 子要素の設定も行う */
			for(var i=0,len=pp.item[idname].children.length;i<len;i++){
				this.setdisplay(""+idname+"_"+pp.item[idname].children[i]);
			}
			break;

		case pp.CHILD:
			var manage = getEL('up_'+idname);
			if(!!manage){
				var val = ui.menu.getConfigVal(pp.item[idname].parent);
				manage.innerHTML = pp.getMenuStr(idname);
				manage.className = ((pp.item[idname].val == val)?"childsel":"child");
			}
			break;

		case pp.CHECK:
			/* チェックボックスの表記の設定 */
			var check = getEL('ck_'+idname);
			if(!!check){ check.checked = ui.menu.getConfigVal(idname);}
			/* ラベルの表記の設定 */
			var label = getEL('cl_'+idname);
			if(!!label){ label.innerHTML = pp.getLabel(idname);}
			break;
		}
		
		if(idname==='keypopup'){
			var kp = ui.keypopup;
			if(kp.paneltype[1]!==0 || kp.paneltype[3]!==0){
				var f = !!kp.paneltype[ui.puzzle.getConfig('mode')];
				getEL('ck_keypopup').disabled    = (f?"":"true");
				getEL('cl_keypopup').style.color = (f?"black":"silver");
			}
		}
		
		if(idname==='bgcolor'){
			if(ui.puzzle.flags.bgcolor){
				var mode = ui.puzzle.getConfig('mode');
				getEL('ck_bgcolor').disabled    = (mode==3?"":"true");
				getEL('cl_bgcolor').style.color = (mode==3?"black":"silver");
			}
		}
		
		if(ui.puzzle.pid==='pipelinkr'){
			getEL('btncircle').value = ((ui.puzzle.getConfig(idname)==1)?"○":"■");
		}
	},

	//---------------------------------------------------------------------------
	// toolarea.toggledisp()   アイスと○などの表示切り替え時の処理を行う
	// toolarea.enb_undo()     html上の[戻][進]ボタンを押すことが可能か設定する
	//---------------------------------------------------------------------------
	toggledisp : function(){
		var current = ui.puzzle.getConfig('disptype_pipelinkr');
		ui.puzzle.setConfig('disptype_pipelinkr', (current==1?2:1));
	},
	enb_undo : function(){
		var opemgr = ui.puzzle.opemgr;
		getEL('btnundo').disabled = (!opemgr.enableUndo ? 'disabled' : '');
		getEL('btnredo').disabled = (!opemgr.enableRedo ? 'disabled' : '');
	},

	//---------------------------------------------------------------------------
	// toolarea.checkclick()   管理領域のチェックボタンが押されたとき、チェック型の設定を設定する
	// toolarea.selectclick()  選択型サブメニュー項目がクリックされたときの動作
	// toolarea.buttonclick()  ボタンがクリックされたときの動作
	//---------------------------------------------------------------------------
	checkclick : function(e){
		var el = (e.target||e.srcElement);
		var idname = el.id.substr(3);
		ui.menu.setConfigVal(idname, !!el.checked);
	},
	selectclick : function(e){
		var list = (e.target||e.srcElement).id.split('_');
		list.shift();
		var child = list.pop(), idname = list.join("_");
		ui.menu.setConfigVal(idname, child);
	},
	buttonclick : function(e){
		var id = (e.target||e.srcElement).id;
		switch(id){
		case 'btncheck':  ui.menu.answercheck(); break;
		case 'btnundo':   ui.puzzle.undo(); ui.menu.enb_undo(); break;
		case 'btnredo':   ui.puzzle.redo(); ui.menu.enb_undo(); break;
		case 'btnclear':  ui.menu.ACconfirm(); break;
		case 'btnclear2': ui.menu.ASconfirm(); break;
		case 'btncolor2': case 'ck_btn_irowake': ui.puzzle.irowake(); break;
		case 'btncolor': ui.puzzle.board.encolorall(); break; /* 天体ショーのボタン */
		}
	}
};

var _doc = document;
function getEL(id){ return _doc.getElementById(id);}
function createButton(){
	button = pzprv3.createEL('input');
	button.type = 'button';
	return button;
}

})();