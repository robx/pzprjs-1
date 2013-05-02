//
// パズル固有スクリプト部 数独版 sudoku.js v3.4.0
//
pzprv3.createCustoms('sudoku', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.mousestart){ this.inputqnum();}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	nummaxfunc : function(){
		return Math.max(this.owner.board.qcols,this.owner.board.qrows);
	}
},
Board:{
	qcols : 9,
	qrows : 9
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBlockBorders();

		this.drawNumbers();

		this.drawChassis();

		this.drawCursor();
	},

	drawBlockBorders : function(){
		var g = this.vinc('border_block', 'crispEdges'), bd = this.owner.board;

		var lw = this.lw, lm = this.lm;

		var max=bd.qcols;
		var block=((Math.sqrt(max)+0.1)|0);
		var headers = ["bbx_", "bby_"];

		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x1<bd.minbx){ x1=bd.minbx;} if(x2>bd.maxbx){ x2=bd.maxbx;}
		if(y1<bd.minby){ y1=bd.minby;} if(y2>bd.maxby){ y2=bd.maxby;}

		g.fillStyle = "black";
		for(var i=1;i<block;i++){
			if(x1-1<=i*block&&i*block<=x2+1){ if(this.vnop(headers[0]+i,this.NONE)){
				g.fillRect(i*block*this.cw-lw+1, y1*this.bh-lw+1, lw, (y2-y1)*this.bh+2*lw-1);
			}}
		}
		for(var i=1;i<block;i++){
			if(y1-1<=i*block&&i*block<=y2+1){ if(this.vnop(headers[1]+i,this.NONE)){
				g.fillRect(x1*this.bw-lw+1, i*block*this.ch-lw+1, (x2-x1)*this.bw+2*lw-1, lw);
			}}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeNumber16();
	},
	pzlexport : function(type){
		this.encodeNumber16();
	},

	decodeKanpen : function(){
		this.owner.fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		this.outsize = [this.owner.board.qcols].join('/');

		this.owner.fio.encodeCellQnum_kanpen();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.sizestr = [this.owner.board.qcols].join("/");

		this.encodeCellQnum();
		this.encodeCellAnumsub();
	},

	kanpenOpen : function(){
		this.decodeCellQnum_kanpen();
		this.decodeCellAnum_kanpen();
	},
	kanpenSave : function(){
		this.sizestr = [this.owner.board.qcols].join("/");

		this.encodeCellQnum_kanpen();
		this.encodeCellAnum_kanpen();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkRoomNumber() ){
			this.setAlert('同じブロックに同じ数字が入っています。','There are same numbers in a block.'); return false;
		}

		if( !this.checkRowsCols(this.isDifferentNumberInClist, function(cell){ return cell.getNum();}) ){
			this.setAlert('同じ列に同じ数字が入っています。','There are same numbers in a row.'); return false;
		}

		if( !this.checkNoNumCell() ){
			this.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkNoNumCell();},

	checkRoomNumber : function(){
		var result = true, bd = this.owner.board;
		var max=bd.qcols;
		var blk=((Math.sqrt(max)+0.1)|0);
		for(var i=0;i<max;i++){
			var clist = bd.cellinside(((i%blk)*blk)*2+1, (((i/blk)|0)*blk)*2+1, ((i%blk+1)*blk-1)*2+1, (((i/blk+1)|0)*blk-1)*2+1);
			if(!this.isDifferentNumberInClist(clist, function(cell){ return cell.getNum();})){
				if(this.inAutoCheck){ return false;}
				result = false;
			}
		}
		return result;
	}
}
});
