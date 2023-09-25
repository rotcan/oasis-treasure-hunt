import { GameObjects } from "phaser";
import { GameState, Player } from "../../../../utils/common";
import { ColorType, GridColors } from "../../../../contract/data";


const roundPos=(x: number,y: number, startx: number, starty: number,
     width: number,height: number):{x: number,y: number,gx: number,gy: number}=>{
        const gx=Math.floor((x-startx)/width);
        const gy=Math.floor((y-starty)/height);
    const nx=x-(x-startx)%width+width/2;
    const ny=y-(y-starty)%width+height/2;
    return {x:nx,y:ny,gx: gy+1, gy: gx+1};
}

const createEmitter=()=>{
    let emitter!: Phaser.Events.EventEmitter
    if(!emitter){
        emitter=new Phaser.Events.EventEmitter()
    }
    return emitter;
}


interface RectData{
    data: ColorType;
    index: number;
}

export interface JoinGameArgs{creator: boolean}
export interface SetPositionArgs{player: Player, position:{x:number,y: number}};

export const EventBus=createEmitter();

let totalWidth=window.innerWidth;
let sx=(totalWidth)/2;
const gridSize=8;
const width=64;
const height=64;
const color=0xE6896B;
const sy=5;
const borderSize=1;

const colors: Map<ColorType,number>=new Map<ColorType,number>();
colors.set(ColorType.Neutral,0xddd4d4);
colors.set(ColorType.Correct,0x8EDD7C);
colors.set(ColorType.InCorrect,0xDD7D7C);
        
export enum GameEvents{
    Player1="create",
    Join="join",
    SetPosition="setPosition",
    HideP1="hideP1",
    ShowPlayer="showPlayer",
    ReadOnly="readOnly",
    EnableMove="enableMove",
    UpdateGrid="updateGrid",
    ResetGrid="resetGrid",
    ScreenResize="screenResize",
}

//Clear & Create Grid
//Player 2 => Set Player 2 pos and player 1 pos (if won). P1 readonly , p2 can be moved
//Player 1 => Set Player 1 & 2 pos. Gamestate > Init (readonly)
//

export class MainPGame extends Phaser.Scene
{
    
    p1: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | undefined;
    p2: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | undefined;
    pselect: any | undefined;
    target: any | undefined;
    p1GridPos: any | undefined;
    p2GridPos: any | undefined;
    selectedItem: any | undefined;

    phys: any | undefined;
    viewOnly: boolean=false;
    cells: Map<number,GameObjects.Rectangle>=new Map();

 
    super(){
        
    }
    preload ()
    {
        //@ts-ignore
        const baseUrl=window.PUBLIC_URL;
        this.load.image('p1', `../..${baseUrl}/assets/img/treasure.png`);
        this.load.image('p2', `../..${baseUrl}/assets/img/detective.png`);
        this.load.image('pselect', `../..${baseUrl}/assets/pselect.png`);
    }

    create ()
    {
        //this.add.image(400, 300, 'bg');
        //this.source=new Phaser.Math.Vector2(x-width*gridSize/2+width/2, y+height/2);
        // const g1 = this.add.grid(sx, sy+height*gridSize/2, width*gridSize, height*gridSize, width, height, color);
        //const r1 = this.add.circle(source.x, source.y, width/2-5, 0x6666ff);
        this.createGrid({x:sx,y:sy+height*gridSize/2+height/2},width,height,gridSize,gridSize,borderSize,ColorType.Neutral);
        
        
        this.pselect=this.physics.add.image(sx-width*gridSize/2+width/2+width, sy+height/2,'pselect').setName("select");
        this.pselect.setAlpha(0);
        
            
        this.target = new Phaser.Math.Vector2();
        this.phys=this.physics;
        EventBus.on(GameEvents.Player1.toString(),this.createGame,this);
        EventBus.on(GameEvents.Join.toString(),this.joinGame,this);
        EventBus.on(GameEvents.HideP1.toString(),this.hideP1,this);
        EventBus.on(GameEvents.ShowPlayer.toString(),this.showPlayer,this);
        EventBus.on(GameEvents.SetPosition.toString(),this.setPosition,this)
        EventBus.on(GameEvents.ReadOnly.toString(),this.readOnly,this)
        EventBus.on(GameEvents.EnableMove.toString(),this.enableMove,this)
        EventBus.on(GameEvents.UpdateGrid.toString(),this.updateGrid,this)
        EventBus.on(GameEvents.ResetGrid.toString(), this.resetGrid, this);
        EventBus.on(GameEvents.ScreenResize.toString(),this.screenResize,this);

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, objectsClicked: Phaser.GameObjects.GameObject[]) =>
        {
            const {x:nx,y:ny,gx, gy}=roundPos(pointer.x,pointer.y,sx-width*gridSize/2,sy,width,height);
            if(gx<0 || gx>gridSize || gy<0 || gy>gridSize)
                return;
            this.target.x = nx;
            this.target.y = ny;
            console.log("x,y",gx,gy)
           
            if(this.viewOnly)
                return;
            objectsClicked.map(m=>{console.log("m",m.name)});
            // window.gridPos.x=gx;
            // window.gridPos.y=gy;
            if(objectsClicked.length>0){
                const o=objectsClicked[0];
                if(o.name==="p1" || o.name==="p2"){
                    console.log("o.body?.position",o.body?.position);
                    this.pselect.body.reset(this.target.x,this.target.y);
                    this.pselect.setAlpha(1);
                    console.log("this.pselect.",this.pselect);
                    this.selectedItem=o;
                }
                
            }else{
                
                if(this.selectedItem){
                    this.pselect.setAlpha(0);
                    if(this.selectedItem.name==="p1"){
                        this.p1GridPos=new Phaser.Math.Vector2(gx,gy);
                        window.p1GridPos={x: this.p1GridPos.x,y:this.p1GridPos.y};
                    }else if(this.selectedItem.name==="p2"){
                        this.p2GridPos=new Phaser.Math.Vector2(gx,gy);
                        window.p2GridPos={x: this.p2GridPos.x,y:this.p2GridPos.y};
                    }
                    this.selectedItem.body.reset(this.target.x,this.target.y)
                }  
            }
            
            
            // Move at 200 px/s:
            // this.physics.moveToObject(this.p1, this.target, 200);

        });
    }
    
    createGame(p1gx: number, p1gy: number, p2gx: number, p2gy: number,gameState:GameState){
        window.p2GridPos={x:p2gx,y:p2gy};
        if(!this.p1)
            this.p1=this.physics.add.image(sx-width*gridSize/2+width/2, sy+height/2,'p1').setInteractive().setName("p1").setAlpha(0);
        this.target=new Phaser.Math.Vector2(sx-width*gridSize/2+(p1gy-1)*width+width/2,
        sy+(p1gx-1)*height+height/2);
        this.p1.body.reset(this.target.x,this.target.y);
        // this.p1.inputEnabled=true;

        if(!this.p2)
        {
            this.p2=this.physics.add.image(sx-width*gridSize/2+width/2+width, sy+height/2,'p2').setName("p2").setAlpha(0);
        }
        this.target=new Phaser.Math.Vector2(sx-width*gridSize/2+(p2gy-1)*width+width/2,
        sy+(p2gx-1)*height+height/2);
        this.p2.body.reset(this.target.x,this.target.y);
        this.p1.setAlpha(1);
        this.p2.setAlpha(1);
        console.log("create Game this.p2",this.p2);
        this.p2.setInteractive();
        this.viewOnly=false;
    }

    joinGame(data: JoinGameArgs){
        console.log("joinGame data",data);
        if(!this.p2)
            this.p2=this.physics.add.image(sx-width*gridSize/2+width/2+width, sy+height/2,'p2') .setInteractive().setName("p2").setAlpha(0);
        // console.log("data.creator",data.creator);
        if(data.creator){
            // console.log("this.p1 1 ",this.p1);
            this.viewOnly=true;
            
        }else{
            this.viewOnly=false;
            
            if(this.p1){
                this.p1.destroy();
                this.p1=undefined;
            }
            console.log("on delete this.p1",this.p1);
                
        }
        // this.p2.inputEnabled=true;
        this.selectedItem=this.p2;
    }
 
    hideP1(_data:any){
        if(this.p1)
        {
            // this.p1.inputEnabled=false;
            this.p1.setAlpha(0);
        }
    }

    showPlayer(data:Player){
        if(data===Player.Player1){
                // this.p1.inputEnabled=false;
            this.p1!.setAlpha(1);
        }
        if(data===Player.Player2){
            // this.p1.inputEnabled=false;
        this.p2!.setAlpha(1);
    }
    }

    setPosition(data: SetPositionArgs){
        const pos: Phaser.Math.Vector2=new Phaser.Math.Vector2(sx-width*gridSize/2+(data.position.y-1)*width+width/2,
        sy+(data.position.x-1)*height+height/2);
        
        if(data.player===Player.Player1)
            window.p1GridPos={x:data.position.x,y:data.position.y};
        else
            window.p2GridPos={x:data.position.x,y:data.position.y};
        if(!this.p2)
            this.p2=this.physics.add.image(sx-width*gridSize/2+width/2, sy+height/2,'p2').setInteractive().setName("p2").setAlpha(0);
        if(!this.p1)
            this.p1=this.physics.add.image(sx-width*gridSize/2+width/2, sy+height/2,'p1').setInteractive().setName("p1").setAlpha(0);
        
        if(data.player===Player.Player2 && this.p2)
            this.p2.body.reset(pos.x,pos.y);
        if(data.player===Player.Player1 && this.p1)
            this.p1.body.reset(pos.x,pos.y);
        console.log("setPosition phaser",data,this.p2);
        // console.log("gx,gy",gx,gy,this.target, this.p2.body.position);
        
    }

    readOnly(data:any){
        // if(this.p1)
        // {
        //     this.p1.inputEnabled=false;
        // }
        // if(this.p2)
        // {
        //     this.p2.inputEnabled=false;
        // }
        this.viewOnly=true;
        // console.log("reaedonly",this.p1,this.p2);
    }

    enableMove(data:any){
        this.viewOnly=false;
    }
    
    
    createGrid(center:{x: number,y:number},cellWidth: number,cellHeight: number,rowCount: number,colCount: number,borderSize: number,data: ColorType){
        this.cells.clear();
        for(var i=0;i<rowCount;i++){
            for(var j=0;j<colCount;j++){
                //top left 
                const borderCellWidth=(cellWidth); //+borderSize+borderSize
                const borderCellHeight=(cellHeight); //+borderSize+borderSize
                const normalCellWidth=(cellWidth-borderSize-borderSize);
                const normalCellHeight=(cellHeight-borderSize-borderSize);
                const cx=center.x-borderCellWidth*(colCount/2)-borderCellWidth/2 + (j+1)*borderCellWidth;
                const cy=center.y-borderCellHeight*(rowCount/2)+ (i) * borderCellHeight;
                const rect=this.add.rectangle(cx,cy,normalCellWidth,normalCellHeight,colors.get(data));
                const index=((i)*colCount+(j));
                rect.setData('type',{data: data, index:index} as RectData);
                this.cells.set(index, rect);
            }
        }
        // console.log("cells",this.cells);
    }

    resetGrid(data:any){
        if(this.cells.size>0){
            for(var i=0;i<this.cells.size;i++){
                this.cells.get(i)!.setData('type',{data:ColorType.Neutral,index:i})
                this.cells.get(i)!.setFillStyle(colors.get(ColorType.Neutral),1);
            }
        }
    }
    
    screenResize(){
        const oldSx=sx;
        totalWidth=window.innerWidth;
        sx=(totalWidth)/2;
        const moveX=sx-oldSx;
        if(this.cells.size>0){
            for(var i=0;i<this.cells.size;i++){
                if(this.cells.has(i)){
                    const oldX=this.cells.get(i)!.x
                    const oldY=this.cells.get(i)!.y
                    this.cells.get(i)?.setPosition(oldX+moveX,oldY);
                }
                
            }
            
        }
        if(this.p1){
            const p1x=this.p1.x;
            const p1y=this.p1.y;
            this.p1.body.reset(p1x+moveX,p1y);
        }
        if(this.p2){
            const p2x=this.p2.x;
            const p2y=this.p2.y;
            this.p2.body.reset(p2x+moveX,p2y);
        }
    }

    updateGrid(data: GridColors){
        // console.log("data",data);
        if(this.cells.size>0){
            for(const index of data.inCorrect){
                const r=this.cells.get(index);
                if(r){
                    const d=r.getData('type') as RectData
                    this.cells.get(index)!.setData('type',{...d, data:ColorType.InCorrect})
                    this.cells.get(index)!.setFillStyle(colors.get(ColorType.InCorrect),1);
                    //console.log("incorrect",this.cells.get(index)!.getData('type'))
                }
            }
            for(const index of data.correct){
                const r=this.cells.get(index);
                if(r){
                    const d=r.getData('type') as RectData
                    // console.log("index",index,"r",data.reset,d,data.reset===true || d.data==ColorType.Correct || d.data===ColorType.Neutral);
                    if(data.reset===true || d.data==ColorType.Correct || d.data===ColorType.Neutral){
                        this.cells.get(index)!.setData('type',{...d, data:ColorType.Correct});
                        this.cells.get(index)!.setFillStyle(colors.get(ColorType.Correct),1);
                    }
                }
            }
        }
    }
}

