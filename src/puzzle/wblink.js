//
// パズル固有スクリプト部 シロクロリンク版 wblink.js v3.4.0
//
pzprv3.createCustoms('wblink', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.btn.Left){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){ this.inputpeke();}
			}
			else if(this.btn.Right){
				if(this.mousestart || this.mousemove){ this.inputpeke();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	},

	inputLine : function(){
		var pos = this.getpos(0);
		if(this.prevPos.equals(pos)){ return;}

		var border = this.getnb(this.prevPos, pos);
		if(!border.isnull){
			var d = border.getlinesize();
			var borders = this.owner.board.borderinside(d.x1,d.y1,d.x2,d.y2);

			if(this.inputData===null){ this.inputData=(border.isLine()?0:1);}
			for(var i=0;i<borders.length;i++){
				if     (this.inputData===1){ borders[i].setLine();}
				else if(this.inputData===0){ borders[i].removeLine();}
			}
			this.inputData=2;

			this.owner.painter.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
		}
		this.prevPos = pos;
	},
	inputpeke : function(){
		var pos = this.getpos(0.22);
		var border = pos.getb();
		if(border.isnull || this.prevPos.equals(pos)){ return;}

		if(this.inputData===null){ this.inputData=(border.getQsub()!==2?2:0);}
		border.setQsub(this.inputData);

		var d = border.getlinesize();
		var borders = this.owner.board.borderinside(d.x1,d.y1,d.x2,d.y2);
		for(var i=0;i<borders.length;i++){ borders[i].setLineVal(0);}
		this.prevPos = pos;

		this.owner.painter.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.key_inputcircle(ca);
	},
	key_inputcircle : function(ca){
		var cell = this.cursor.getTCC();

		if     (ca=='1'){ cell.setQnum(cell.getQnum()!==1?1:-1);}
		else if(ca=='2'){ cell.setQnum(cell.getQnum()!==2?2:-1);}
		else if(ca=='-'){ cell.setQnum(cell.getQnum()!==-2?-2:-1);}
		else if(ca=='3'||ca==" "){ cell.setQnum(-1);}
		else{ return;}

		cell.draw();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	numberAsObject : true,

	maxnum : 2
},
Border:{
	getlinesize : function(){
		var pos1 = this.getaddr(), pos2 = pos1.clone();
		if(this.isVert()){
			while(pos1.move(-1,0).getc().noNum()){ pos1.move(-1,0);}
			while(pos2.move( 1,0).getc().noNum()){ pos2.move( 1,0);}
		}
		else{
			while(pos1.move(0,-1).getc().noNum()){ pos1.move(0,-1);}
			while(pos2.move(0, 1).getc().noNum()){ pos2.move(0, 1);}
		}
		if(pos1.getc().isnull || pos2.getc().isnull){ return {x1:-1,y1:-1,x2:-1,y2:-1};}
		return {x1:pos1.bx, y1:pos1.by, x2:pos2.bx, y2:pos2.by};
	}
},

Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1
},

LineManager:{
	isCenterLine : true
},

AreaLineManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_THIN;
		this.errbcolor1 = "white";
		this.circleratio = [0.35, 0.30];

		// 線の太さを通常より少し太くする
		this.lwratio = 8;
	},
	paint : function(){
		this.drawGrid(false, (this.owner.editmode && !this.outputImage));

		this.drawPekes();
		this.drawLines();

		this.drawQnumCircles();
		this.drawHatenas();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeCircle();
	},
	encodePzpr : function(type){
		this.encodeCircle();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLcntCell(4) ){ return 40301;}

		var linfo = this.owner.board.getLareaInfo();
		if( !this.checkTripleObject(linfo) ){ return 43302;}

		if( !this.checkWBcircle(linfo, 1) ){ return 48001;}
		if( !this.checkWBcircle(linfo, 2) ){ return 48011;}

		if( !this.checkAloneCircle() ){ return 43505;}

		return 0;
	},

	checkAloneCircle : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt()===0 && cell.isNum());});
	},

	checkWBcircle : function(linfo,val){
		var result = true;
		for(var r=1;r<=linfo.max;r++){
			var clist = linfo.room[r].clist;
			if(clist.length<=1){ continue;}

			var tip1 = clist[0], tip2 = clist[clist.length-1];
			if(tip1.getQnum()!==val || tip2.getQnum()!==val){ continue;}

			if(this.checkOnly){ return false;}
			if(result){ this.owner.board.border.seterr(-1);}
			linfo.setErrLareaById(r,1);
			tip1.seterr(1);
			tip2.seterr(1);
			result = false;
		}
		return result;
	}
}
});