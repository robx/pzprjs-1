//
// パズル固有スクリプト部 アイスローム版 icelom.js v3.3.0
//
Puzzles.icelom = function(){ };
Puzzles.icelom.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 8;}	// 盤面の縦幅
		k.irowake = 1;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 1;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 1;	// 1:線が交差するパズル
		k.isCenterLine    = 1;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 0;	// 1:0を表示するかどうか
		k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		//k.def_csize = 36;
		k.def_psize = 36;
		k.area = { bcell:0, wcell:0, number:0, disroom:1};	// areaオブジェクトで領域を生成する

		if(k.EDITOR){
			base.setExpression("　左クリックで数字、左ドラッグでIN/OUTが、右クリックで氷が入力できます。"+
							   "またキーボードの数字キーで数字が、Qキーで氷が入力できます。",
							   " Left Click to input numbers, Left Button Drag to input arrows and Right Click to input ice."+
							   " By keyboard, number keys to input numbers and Q key to input ice.");
		}
		else{
			base.setExpression("　左ドラッグで線が、右クリックで×が入力できます。",
							   " Left Button Drag to input black cells, Right Click to input a cross.");
		}
		base.setTitle("アイスローム","Icelom");
		base.setFloatbgcolor("rgb(0, 0, 127)");
	},
	menufix : function(){
		if(k.EDITOR){
			pp.addCheck('allwhite','setting',true, '白マスは全部通る', 'Pass All White Cell');
			pp.setLabel('allwhite', '白マスを全部通ったら正解にする', 'Complete if the line passes all white cell');
			pp.funcs['allwhite'] = function(){
				if(pp.getVal('allwhite')){ base.setTitle("アイスローム","Icelom");}
				else                     { base.setTitle("アイスローム２","Icelom 2");}
				document.title = base.gettitle();
				ee('title2').el.innerHTML = base.gettitle();
			};
		}

		menu.addRedLineToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine(); return;}
			if(k.editmode){
				if(this.btn.Left) this.inputarrow();
				else if(this.btn.Right) this.inputIcebarn();
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){ this.inputqnum();}
		};
		mv.mousemove = function(){
			if(k.editmode){
				if(this.btn.Left) this.inputarrow();
				else if(this.btn.Right) this.inputIcebarn();
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.inputIcebarn = function(){
			var cc = this.cellid();
			if(cc==-1 || cc==this.mouseCell){ return;}
			if(bd.QnC(cc)!==-1){ this.inputqnum(); return;}

			if(this.inputData==-1){ this.inputData = (bd.QuC(cc)==6?0:6);}

			bd.sQuC(cc, this.inputData);
			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
			this.mouseCell = cc;
		};
		mv.inputarrow = function(){
			var pos = this.cellpos();
			if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return;}

			var id = -1;
			if     (pos.y-this.mouseCell.y==-1){ id=bd.bnum(this.mouseCell.x*2+1,this.mouseCell.y*2  ); if(this.inputData!=0){ this.inputData=1;} }
			else if(pos.y-this.mouseCell.y== 1){ id=bd.bnum(this.mouseCell.x*2+1,this.mouseCell.y*2+2); if(this.inputData!=0){ this.inputData=2;} }
			else if(pos.x-this.mouseCell.x==-1){ id=bd.bnum(this.mouseCell.x*2  ,this.mouseCell.y*2+1); if(this.inputData!=0){ this.inputData=1;} }
			else if(pos.x-this.mouseCell.x== 1){ id=bd.bnum(this.mouseCell.x*2+2,this.mouseCell.y*2+1); if(this.inputData!=0){ this.inputData=2;} }

			this.mouseCell = pos;

			if(id==-1 || id<bd.bdinside){ return;}
			else{
				if(bd.border[id].cx==0 || bd.border[id].cy==0){
					if     (this.inputData==1){ bd.inputarrowout(id);}
					else if(this.inputData==2){ bd.inputarrowin (id);}
				}
				else{
					if     (this.inputData==1){ bd.inputarrowin (id);}
					else if(this.inputData==2){ bd.inputarrowout(id);}
				}
			}
			pc.paintBorder(id);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true;}
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			if(this.key_inputIcebarn(ca)){ return;}
			this.key_inputqnum(ca);
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		kc.key_inputIcebarn = function(ca){
			var cc = tc.getTCC();

			if(ca==='q'){
				bd.sQuC(cc, bd.QuC(cc)==6?0:6);
			}
			else if(ca===' ' && bd.QnC(cc)===-1){
				bd.sQuC(cc, 0);
			}
			else{ return false;}

			var cx=bd.cell[cc].cx, cy=bd.cell[cc].cy;
			pc.paint(cx-1, cy-1, cx+1, cy+1);
			this.prev = cc;
			return true;
		};

		if(!bd.arrowin) { bd.arrowin  = -1;}
		if(!bd.arrowout){ bd.arrowout = -1;}
		bd.ainobj  = ee.createEL(pc.EL_NUMOBJ,'');
		bd.aoutobj = ee.createEL(pc.EL_NUMOBJ,'');
		bd.inputarrowin = function(id){
			var dir=((this.border[id].cx==0||this.border[id].cy==0)?1:2);
			this.setArrow(this.arrowin,0);
			pc.paintBorder(this.arrowin);
			if(this.arrowout==id){
				this.arrowout = this.arrowin;
				this.setArrow(this.arrowout, ((dir+1)%2)+1);
				pc.paintBorder(this.arrowout);
			}
			this.arrowin = id;
			this.setArrow(this.arrowin, (dir%2)+1);
		};
		bd.inputarrowout = function(id){
			var dir=((this.border[id].cx==0||this.border[id].cy==0)?1:2);
			this.setArrow(this.arrowout,0);
			pc.paintBorder(this.arrowout);
			if(this.arrowin==id){
				this.arrowin = this.arrowout;
				this.setArrow(this.arrowin, (dir%2)+1);
				pc.paintBorder(this.arrowin);
			}
			this.arrowout = id;
			this.setArrow(this.arrowout, ((dir+1)%2)+1);
		};
		bd.getArrow = function(id){ return this.QuB(id); };
		bd.setArrow = function(id,val){ if(id!==-1){ this.sQuB(id,val);}};
		bd.isArrow  = function(id){ return (this.QuB(id)>0);};

		bd.initSpecial = function(col,row){
			this.bdinside = 2*col*row-(col+row);
			if(this.arrowin==-1 && this.arrowout==-1){
				this.inputarrowin (0 + this.bdinside, 1);
				this.inputarrowout(2 + this.bdinside, 1);
			}

			if(!base.initProcess){
				if(this.arrowin<k.qcols+this.bdinside){ if(this.arrowin>col+this.bdinside){ this.arrowin=col+this.bdinside-1;} }
				else{ if(this.arrowin>col+row+this.bdinside){ this.arrowin=col+row+this.bdinside-1;} }

				if(this.arrowout<k.qcols+this.bdinside){ if(this.arrowout>col+this.bdinside){ this.arrowout=col+this.bdinside-1;} }
				else{ if(this.arrowout>col+row+this.bdinside){ this.arrowout=col+row+this.bdinside-1;} }

				if(this.arrowin==this.arrowout){ this.arrowin--;}
			}
		}

		menu.ex.adjustSpecial = function(type,key){
			um.disableRecord();
			var ibx=bd.border[bd.arrowin ].cx, iby=bd.border[bd.arrowin ].cy;
			var obx=bd.border[bd.arrowout].cx, oby=bd.border[bd.arrowout].cy;
			switch(type){
			case 1: // 上下反転
				bd.arrowin  = bd.bnum(ibx,2*k.qrows-iby);
				bd.arrowout = bd.bnum(obx,2*k.qrows-oby);
				break;
			case 2: // 左右反転
				bd.arrowin  = bd.bnum(2*k.qcols-ibx,iby);
				bd.arrowout = bd.bnum(2*k.qcols-obx,oby);
				break;
			case 3: // 右90°反転
				bd.arrowin  = bd.bnum2(2*k.qrows-iby,ibx,k.qrows,k.qcols);
				bd.arrowout = bd.bnum2(2*k.qrows-oby,obx,k.qrows,k.qcols);
				break;
			case 4: // 左90°反転
				bd.arrowin  = bd.bnum2(iby,2*k.qcols-ibx,k.qrows,k.qcols);
				bd.arrowout = bd.bnum2(oby,2*k.qcols-obx,k.qrows,k.qcols);
				break;
			case 5: // 盤面拡大
				bd.arrowin  += (key==k.UP||key==k.DN?2*k.qcols-1:2*k.qrows-1);
				bd.arrowout += (key==k.UP||key==k.DN?2*k.qcols-1:2*k.qrows-1);
				break;
			case 6: // 盤面縮小
				bd.arrowin  -= (key==k.UP||key==k.DN?2*k.qcols-1:2*k.qrows-1);
				bd.arrowout -= (key==k.UP||key==k.DN?2*k.qcols-1:2*k.qrows-1);
				break;
			}

			um.enableRecord();
		};
		menu.ex.expandborder = function(key){ };
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.linecolor = pc.linecolor_LIGHT;
		pc.errcolor1 = "red";
		pc.BCell_fontcolor = pc.fontcolor;
		pc.setBGCellColorFunc('icebarn');

		pc.maxYdeg = 0.70;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);

			this.drawIceBorders(x1,y1,x2,y2);

			this.drawLines(x1,y1,x2,y2);
			this.drawPekes(x1,y1,x2,y2,1);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawArrows(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);

			this.drawInOut();
		};

		// IN/OUTの矢印用に必要ですね。。
		pc.drawArrows = function(x1,y1,x2,y2){
			var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+4,y2*2+4,function(id){ return (id>=bd.bdinside);});
			for(var i=0;i<idlist.length;i++){ this.drawArrow1(idlist[i], bd.isArrow(idlist[i]));}
			this.vinc();
		};
		pc.drawArrow1 = function(id, flag){
			var vids = ["b_ar_"+id,"b_dt1_"+id,"b_dt2_"+id];
			if(!flag){ this.vhide(vids); return;}

			var ll = mf(k.cwidth*0.35);							//LineLength
			var lw = (mf(k.cwidth/24)>=1?mf(k.cwidth/24):1);	//LineWidth
			var lm = mf((lw-1)/2);								//LineMargin
			var px=bd.border[id].px; var py=bd.border[id].py;

			g.fillStyle = (bd.border[id].error===3 ? this.errcolor1 : this.Cellcolor);
			if(this.vnop(vids[0],this.FILL)){
				if(bd.border[id].cx&1){ g.fillRect(px-lm, py-ll, lw, ll*2);}
				if(bd.border[id].cy&1){ g.fillRect(px-ll, py-lm, ll*2, lw);}
			}

			if(bd.getArrow(id)===1){
				if(this.vnop(vids[1],this.FILL)){
					if(bd.border[id].cx&1){ g.setOffsetLinePath(px,py ,0,-ll ,-ll/2,-ll*0.4 ,ll/2,-ll*0.4, true);}
					if(bd.border[id].cy&1){ g.setOffsetLinePath(px,py ,-ll,0 ,-ll*0.4,-ll/2 ,-ll*0.4,ll/2, true);}
					g.fill();
				}
			}
			else{ this.vhide(vids[1]);}
			if(bd.getArrow(id)===2){
				if(this.vnop(vids[2],this.FILL)){
					if(bd.border[id].cx&1){ g.setOffsetLinePath(px,py ,0,+ll ,-ll/2, ll*0.4 ,ll/2, ll*0.4, true);}
					if(bd.border[id].cy&1){ g.setOffsetLinePath(px,py , ll,0 , ll*0.4,-ll/2 , ll*0.4,ll/2, true);}
					g.fill();
				}
			}
			else{ this.vhide(vids[2]);}
		};
		pc.drawInOut = function(){
			if(bd.arrowin<bd.bdinside || bd.arrowin>=bd.bdmax || bd.arrowout<bd.bdinside || bd.arrowout>=bd.bdmax){ return;}

			g.fillStyle = (bd.border[bd.arrowin].error===3 ? this.errcolor1 : this.Cellcolor);
			var bx = bd.border[bd.arrowin].cx, by = bd.border[bd.arrowin].cy;
			if     (by===0)        { this.dispString(bd.ainobj, "IN", ((bx+1.3)/2)*k.cwidth+3 , ((by+0.5)/2)*k.cheight-5);}
			else if(by===2*k.qrows){ this.dispString(bd.ainobj, "IN", ((bx+1.3)/2)*k.cwidth+3 , ((by+2.0)/2)*k.cheight+12);}
			else if(bx===0)        { this.dispString(bd.ainobj, "IN", ((bx+1.0)/2)*k.cwidth-12, ((by+1.0)/2)*k.cheight-7);}
			else if(bx===2*k.qcols){ this.dispString(bd.ainobj, "IN", ((bx+2.0)/2)*k.cwidth+6 , ((by+1.0)/2)*k.cheight-7);}

			g.fillStyle = (bd.border[bd.arrowout].error===3 ? this.errcolor1 : this.Cellcolor);
			var bx = bd.border[bd.arrowout].cx, by = bd.border[bd.arrowout].cy;
			if     (by===0)        { this.dispString(bd.aoutobj, "OUT", ((bx+1.0)/2)*k.cwidth-2 , ((by+0.5)/2)*k.cheight-5);}
			else if(by===2*k.qrows){ this.dispString(bd.aoutobj, "OUT", ((bx+1.0)/2)*k.cwidth-2 , ((by+2.0)/2)*k.cheight+12);}
			else if(bx===0)        { this.dispString(bd.aoutobj, "OUT", ((bx+0.5)/2)*k.cwidth-19, ((by+1.0)/2)*k.cheight-7);}
			else if(bx===2*k.qcols){ this.dispString(bd.aoutobj, "OUT", ((bx+2.0)/2)*k.cwidth+5 , ((by+1.0)/2)*k.cheight-7);}
		};
		pc.dispString = function(el, text, px, py){
			el.style.fontSize = (k.cwidth*0.55)+'px';
			el.style.left     = k.cv_oft.x + px+(!k.br.IE?2:4);
			el.style.top      = k.cv_oft.y + py+(!k.br.IE?1:5);
			el.style.color    = g.fillStyle;
			el.innerHTML      = text;
			this.showEL(el);
		};

		line.repaintParts = function(id){
			if(id===bd.arrowin || id===bd.arrowout){ pc.drawArrow1(id,true);}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeIcelom();
			this.decodeNumber16();
			this.decodeInOut();

			if(k.EDITOR){
				if(this.checkpflag("a")){ pp.setVal('allwhite',true);}
				else                    { pp.setVal('allwhite',false);}
			}
			else{
				if(this.checkpflag("a")){ base.setTitle("アイスローム","Icelom");}
				else                    { base.setTitle("アイスローム２","Icelom 2");}
				document.title = base.gettitle();
				ee('title2').el.innerHTML = base.gettitle();
			}
		};
		enc.pzlexport = function(type){
			this.encodeIcelom();
			this.encodeNumber16();
			this.encodeInOut();

			this.outpflag = (pp.getVal('allwhite') ? "a" : "");
		};

		enc.decodeIcelom = function(){
			var bstr = this.outbstr;

			var a=0;
			for(var i=0;i<bstr.length;i++){
				var num = parseInt(bstr.charAt(i),32);
				for(var w=0;w<5;w++){ if((i*5+w)<bd.cellmax){ bd.sQuC(i*5+w,(num&Math.pow(2,4-w)?6:0));} }
				if((i*5+5)>=k.qcols*k.qrows){ a=i+1; break;}
			}
			this.outbstr = bstr.substr(a);
		};
		enc.encodeIcelom = function(){
			var cm = "";
			var num=0, pass=0;
			for(i=0;i<k.qcols*k.qrows;i++){
				if(bd.QuC(i)==6){ pass+=Math.pow(2,4-num);}
				num++; if(num==5){ cm += pass.toString(32); num=0; pass=0;}
			}
			if(num>0){ cm += pass.toString(32);}

			this.outbstr += cm;
		};

		enc.decodeInOut = function(){
			var barray = this.outbstr.substr(1).split("/");

			bd.setArrow(bd.arrowin,0); bd.setArrow(bd.arrowout,0);
			bd.arrowin = bd.arrowout = -1;
			bd.inputarrowin (parseInt(barray[0])+bd.bdinside);
			bd.inputarrowout(parseInt(barray[1])+bd.bdinside);

			this.outbstr = "";
		};
		enc.encodeInOut = function(){
			this.outbstr += ("/"+(bd.arrowin-bd.bdinside)+"/"+(bd.arrowout-bd.bdinside));
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			bd.inputarrowin (parseInt(this.readLine()));
			bd.inputarrowout(parseInt(this.readLine()));

			var pzltype = this.readLine();
			if(k.EDITOR){
				pp.setVal('allwhite',(pzltype==="allwhite"));
			}
			else{
				if(pzltype==="allwhite"){ base.setTitle("アイスローム","Icelom");}
				else                    { base.setTitle("アイスローム２","Icelom 2");}
				document.title = base.gettitle();
				ee('title2').el.innerHTML = base.gettitle();
			}

			this.decodeCell( function(c,ca){
				if(ca.charAt(0)=='i'){ bd.sQuC(c,6); ca=ca.substr(1);}
				if     (ca==''||ca=='.'){ return;}
				else if(ca=='?'){ bd.sQnC(c,-2);}
				else            { bd.sQnC(c,parseInt(ca));}
			});

			this.decodeBorder2( function(c,ca){
				if     (ca == "1" ){ bd.sLiB(c, 1);}
				else if(ca == "-1"){ bd.sQsB(c, 2);}
			});
		};
		fio.encodeData = function(){
			var pzltype = (pp.getVal('allwhite') ? "allwhite" : "skipwhite");

			this.datastr += (bd.arrowin+"/"+bd.arrowout+"/"+pzltype+"/");
			this.encodeCell( function(c){
				var istr = (bd.QuC(c)===6 ? "i" : "");
				if     (bd.QnC(c)===-1){ return (istr==="" ? ". " : "i ");}
				else if(bd.QnC(c)===-2){ return istr+"? ";}
				else{ return istr+bd.QnC(c)+" ";}
			});
			this.encodeBorder2( function(c){
				if     (bd.LiB(c)===1){ return "1 "; }
				else if(bd.QsB(c)===2){ return "-1 ";}
				else                  { return "0 "; }
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branch line.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)==4 && bd.QuC(c)!=6 && bd.QuC(c)!=101);}) ){
				this.setAlert('氷の部分以外で線が交差しています。', 'A Line is crossed outside of ice.'); return false;
			}
			if( !this.checkAllCell(ee.binder(this, function(c){ return (line.lcntCell(c)==2 && bd.QuC(c)==6 && !this.isLineStraight(c));})) ){
				this.setAlert('氷の部分で線が曲がっています。', 'A Line curve on ice.'); return false;
			}

			var flag = this.searchLine();
			if( flag==-1 ){
				this.setAlert('スタート位置を特定できませんでした。', 'The system can\'t detect start position.'); return false;
			}
			if( flag==1 ){
				this.setAlert('INに線が通っていません。', 'The line doesn\'t go through the \'IN\' arrow.'); return false;
			}
			if( flag==2 ){
				this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
			}
			if( flag==3 ){
				this.setAlert('盤面の外に出てしまった線があります。', 'A line is not reached out the \'OUT\' arrow.'); return false;
			}
			if( flag==4 ){
				this.setAlert('数字の通過順が間違っています。', 'A line goes through an arrow reverse.'); return false;
			}

			if( !this.checkOneLoop() ){
				this.setAlert('線がひとつながりではありません。', 'Lines are not countinuous.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
			}

			if( this.isallwhite() && !this.checkAllCell(ee.binder(this, function(c){ return (line.lcntCell(c)==0 && bd.QuC(c)!==6);})) ){
				this.setAlert('通過していない白マスがあります。', 'The line doesn\'t pass all of the white cell.'); return false;
			}

			if( !this.isallwhite() && !this.checkIcebarns() ){
				this.setAlert('すべてのアイスバーンを通っていません。', 'A icebarn is not gone through.'); return false;
			}

			if( !this.checkAllCell(ee.binder(this, function(c){ return (line.lcntCell(c)==0 && bd.QnC(c)!==-1);})) ){
				this.setAlert('通過していない数字があります。', 'The line doesn\'t pass all of the number.'); return false;
			}

			return true;
		};
		ans.isallwhite = function(){ return ((k.EDITOR&&pp.getVal('allwhite'))||(k.PLAYER&&enc.checkpflag("t")));};

		ans.checkIcebarns = function(){
			var iarea = new AreaInfo();
			for(var cc=0;cc<bd.cellmax;cc++){ iarea.id[cc]=(bd.QuC(cc)==6?0:-1); }
			for(var cc=0;cc<bd.cellmax;cc++){
				if(iarea.id[cc]!=0){ continue;}
				iarea.max++;
				iarea[iarea.max] = {clist:[]};
				area.sc0(cc,iarea);

				iarea.room[iarea.max] = {idlist:iarea[iarea.max].clist};
			}

			return this.checkOneNumber(iarea, function(top,lcnt){ return (lcnt==0);}, function(cc){ return line.lcntCell(cc)>0;});
		};

		ans.searchLine = function(){
			var bx=bd.border[bd.arrowin].cx, by=bd.border[bd.arrowin].cy;
			var dir=0, count=1;
			if     (by==0){ dir=2;}else if(by==2*k.qrows){ dir=1;}
			else if(bx==0){ dir=4;}else if(bx==2*k.qcols){ dir=3;}
			if(dir==0){ return -1;}
			if(!bd.isLine(bd.arrowin)){ bd.sErB([bd.arrowin],3); return 1;}

			bd.sErBAll(2);
			bd.sErB([bd.arrowin],1);

			while(1){
				switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
				if(!((bx+by)&1)){
					var cc = bd.cnum(bx>>1,by>>1);
					if(bd.QuC(cc)!=6){
						if     (line.lcntCell(cc)!=2){ dir=dir;}
						else if(dir!=1 && bd.isLine(bd.bnum(bx,by+1))){ dir=2;}
						else if(dir!=2 && bd.isLine(bd.bnum(bx,by-1))){ dir=1;}
						else if(dir!=3 && bd.isLine(bd.bnum(bx+1,by))){ dir=4;}
						else if(dir!=4 && bd.isLine(bd.bnum(bx-1,by))){ dir=3;}
					}

					var num = bd.getNum(cc);
					if(num===-1){ continue;}
					if(num!==-2 && num!==count){ bd.sErC([cc],1); return 4;}
					count++;
				}
				else{
					var id = bd.bnum(bx,by);
					bd.sErB([id],1);
					if(!bd.isLine(id)){ return 2;}
					if(bd.arrowout==id){ break;}
					else if(id==-1 || id>=bd.bdinside){ return 3;}
				}
			}

			bd.sErBAll(0);

			return 0;
		};
	}
};
