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

export const getTruncatedAddress=(address: string,strip0x: boolean=true, charLength:number=3)=>{
    const finalAddress=strip0x ? address.startsWith("0x") ? address.substring(2) : address : address;
    return finalAddress.substring(0,charLength)+".."+finalAddress.substring(finalAddress.length-charLength-1,finalAddress.length-1);
}