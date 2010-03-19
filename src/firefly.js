//
// パズル固有スクリプト部 ホタルビーム版 firefly.js v3.3.0
//
Puzzles.firefly = function(){ };
Puzzles.firefly.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 1;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 1;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 1;	// 1:0を表示するかどうか
		k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		//k.def_csize = 36;
		k.def_psize = 16;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		if(k.EDITOR){
			base.setExpression("　黒点は、マウスの左ドラッグか、SHIFT押しながら矢印キーで入力できます。",
							   " To input black marks, Left Button Drag or Press arrow key with SHIFT key.");
		}
		else{
			base.setExpression("　左ドラッグで境界線が、右ドラッグで補助記号が入力できます。",
							   " Left Button Drag to input border lines, Right to input auxiliary marks.");
		}
		base.setTitle("ホタルビーム", 'Hotaru Beam'); //'Glow of Fireflies');
		base.setFloatbgcolor("rgb(0, 224, 0)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode) this.inputdirec();
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){
			if(k.editmode && this.notInputted() && bd.cnum(this.mouseCell.x,this.mouseCell.y)==this.cellid()) this.inputqnum();
		};
		mv.mousemove = function(){
			if(k.editmode){
				if(this.notInputted()) this.inputdirec();
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.enableInputHatena = true;

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.key_inputdirec(ca)){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;

		pc.fontErrcolor = pc.fontcolor;
		pc.fontsizeratio = 0.85;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawDashLines(x1,y1,x2,y2);
			this.drawLines(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,0);

			this.drawNumCells_firefly(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.drawNumCells_firefly = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1-2,y1-2,x2+2,y2+2);
			for(var i=0;i<clist.length;i++){ this.drawNumCells_firefly1(clist[i]);}
			this.vinc();
		};
		pc.drawNumCells_firefly1 = function(c){
			if(c===-1){ return;}

			var rsize  = k.cwidth*0.40;
			var rsize2 = k.cwidth*0.36;
			var rsize3 = k.cwidth*0.10;
			var headers = ["c_cira_", "c_cirb_", "c_circ_"];

			if(bd.cell[c].qnum!=-1){
				var px=bd.cell[c].px+mf(k.cwidth/2), py=bd.cell[c].py+mf(k.cheight/2);

				g.fillStyle = this.Cellcolor;
				if(this.vnop(headers[0]+c,this.NONE)){
					g.fillCircle(px, py, rsize);
				}

				g.fillStyle = (bd.cell[c].error===1 ? this.errbcolor1 : "white");
				if(this.vnop(headers[1]+c,this.FILL)){
					g.fill(px, py, rsize2);
				}

				this.vdel([headers[2]+c]);
				if(bd.cell[c].direc!=0){
					g.fillStyle = this.Cellcolor;
					switch(bd.cell[c].direc){
						case k.UP: py-=(rsize-1); break;
						case k.DN: py+=(rsize-1); break;
						case k.LT: px-=(rsize-1); break;
						case k.RT: px+=(rsize-1); break;
					}
					if(this.vnop(headers[2]+c,this.NONE)){
						g.fillCircle(px, py, rsize3);
					}
				}
			}
			else{ this.vhide([headers[0]+c, headers[1]+c, headers[2]+c]);}

			this.dispnumCell(c);
		};

		line.repaintParts = function(id){
			pc.drawNumCells_firefly1( bd.cc1(id) );
			pc.drawNumCells_firefly1( bd.cc2(id) );
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeArrowNumber16();
		};
		enc.pzlexport = function(type){
			this.encodeArrowNumber16();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellDirecQnum();
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.encodeCellDirecQnum();
			this.encodeBorderLine();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。', 'There is a branch line.'); return false;
			}
			if( !this.checkLcntCell(4) ){
				this.setAlert('線が交差しています。', 'There is a crossing line.'); return false;
			}

			var errinfo = this.searchFireflies();
			if( !this.checkErrorFlag(errinfo,3) ){
				this.setAlert('黒点同士が線で繋がっています。', 'Black points are connected each other.'); return false;
			}
			if( !this.checkErrorFlag(errinfo,2) ){
				this.setAlert('線の曲がった回数が数字と違っています。', 'The number of curves is different from a firefly\'s number.'); return false;
			}
			if( !this.checkErrorFlag(errinfo,1) ){
				this.setAlert('線が途中で途切れています。', 'There is a dead-end line.'); return false;
			}

			this.performAsLine = true;
			if( !this.checkOneArea( line.getLareaInfo() ) ){
				this.setAlert('線が全体で一つながりになっていません。', 'All lines and fireflies are not connected each other.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('線が途中で途切れています。', 'There is a dead-end line.'); return false;
			}

			if( !this.checkFireflyBeam() ){
				this.setAlert('ホタルから線が出ていません。', 'There is a lonely firefly.'); return false;
			}

			if( !this.checkStrangeLine(errinfo) ){
				this.setAlert('白丸の、黒点でない部分どうしがくっついています。', 'Fireflies are connected without a line starting from black point.'); return false;
			}

			bd.sErBAll(0);
			return true;
		};
		ans.check1st = function(){ return true;};

		ans.checkLcntCell = function(val){
			var result = true;
			if(line.ltotal[val]==0){ return true;}
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QnC(c)==-1 && line.lcntCell(c)==val){
					if(this.inAutoCheck){ return false;}
					if(result){ bd.sErBAll(2);}
					ans.setCellLineError(c,false);
					result = false;
				}
			}
			return result;
		};
		ans.checkFireflyBeam = function(){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QnC(c)==-1 || bd.DiC(c)==0){ continue;}
				if((bd.DiC(c)==k.UP && !bd.isLine(bd.ub(c))) || (bd.DiC(c)==k.DN && !bd.isLine(bd.db(c))) ||
				   (bd.DiC(c)==k.LT && !bd.isLine(bd.lb(c))) || (bd.DiC(c)==k.RT && !bd.isLine(bd.rb(c))) )
				{
					if(this.inAutoCheck){ return false;}
					bd.sErC([c],1);
					result = false;
				}
			}
			return result;
		};
		ans.checkStrangeLine = function(errinfo){
			var idlist = [];
			for(var id=0;id<bd.bdmax;id++){
				if(bd.isLine(id) && errinfo.check[id]!=2){ idlist.push(id);}
			}
			if(idlist.length>0){
				bd.sErBAll(2);
				bd.sErB(idlist,1);
				return false;
			}
			return true;
		};

		ans.searchFireflies = function(){
			var errinfo={data:[],check:[]};
			for(var i=0;i<bd.bdmax;i++){ errinfo.check[i]=0;}

			for(var c=0;c<bd.cellmax;c++){
				if(bd.QnC(c)==-1 || bd.DiC(c)==0){ continue;}

				var ccnt=0;
				var idlist = [];
				var dir=bd.DiC(c);
				var bx=bd.cell[c].cx*2+1, by=bd.cell[c].cy*2+1;
				while(1){
					switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
					if(!((bx+by)&1)){
						var cc = bd.cnum(bx>>1,by>>1);
						if     (bd.QnC(cc)!=-1){ break;}
						else if(dir!=1 && bd.isLine(bd.bnum(bx,by+1))){ if(dir!=2){ ccnt++;} dir=2;}
						else if(dir!=2 && bd.isLine(bd.bnum(bx,by-1))){ if(dir!=1){ ccnt++;} dir=1;}
						else if(dir!=3 && bd.isLine(bd.bnum(bx+1,by))){ if(dir!=4){ ccnt++;} dir=4;}
						else if(dir!=4 && bd.isLine(bd.bnum(bx-1,by))){ if(dir!=3){ ccnt++;} dir=3;}
					}
					else{
						var id = bd.bnum(bx,by);
						if(!bd.isLine(id)){ break;}
						idlist.push(id);
					}
				}

				for(var i=0;i<idlist.length;i++){ errinfo.check[idlist[i]]=2;}

				var cc = bd.cnum(bx>>1,by>>1);
				if(((bd.DiC(cc)==k.UP && dir==k.DN) || (bd.DiC(cc)==k.DN && dir==k.UP) ||
					(bd.DiC(cc)==k.LT && dir==k.RT) || (bd.DiC(cc)==k.RT && dir==k.LT) ) && (!((bx+by)&1)))
				{
					errinfo.data.push({errflag:3,cells:[c,cc],idlist:idlist}); continue;
				}
				if(idlist.length>0 && (!((bx+by)&1)) && bd.QnC(c)!=-2 && bd.QnC(c)!=ccnt){
					errinfo.data.push({errflag:2,cells:[c],idlist:idlist}); continue;
				}
				if(idlist.length>0 && ((bx+by)&1)){
					errinfo.data.push({errflag:1,cells:[c],idlist:idlist}); continue;
				}
			}
			return errinfo;
		};
		ans.checkErrorFlag = function(errinfo, val){
			var result = true;
			for(var i=0,len=errinfo.data.length;i<len;i++){
				if(errinfo.data[i].errflag!=val){ continue;}

				if(this.inAutoCheck){ return false;}
				bd.sErC(errinfo.data[i].cells,1);
				if(result){ bd.sErBAll(2);}
				bd.sErB(errinfo.data[i].idlist,1);
				result = false;
			}
			return result;
		};
	}
};
