export enum Player{
    Player1,
    Player2
}

export enum GameState{
    Setup,
    Init,
    End
}

export enum MoveResult{
    Near,Far,Exact,Same
}

export enum BidType{
    Free, Half,Full
}

export const getDateInNumber=():number=>{
    //@ts-ignore
    return new Date()/1
}