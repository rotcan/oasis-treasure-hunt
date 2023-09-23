import { useState } from "react";

const ExistingGamesList=({list,selectGame}:{list:string[],selectGame: (val: string)=>void})=>{
    const [selectedGame,setSelectedGame]=useState<string|undefined>(undefined);
  
    const selectOption=(e: string)=>{
    
        setSelectedGame(e);
    }

    return (
        <div>
        {list.length > 0 && (
          <>
            Select existing game
            <select onChange={(e)=>{selectOption(e.target.value)}}>
            <option key="-1" value="-1">Select</option>
              {list.map((m,index) => {
                return <option key={index} value={m}>{m}</option>;
              })}
            </select>
            <button onClick={()=>{selectedGame && selectedGame!=="-1" && selectGame(selectedGame)}}>Select</button>
          </>
        )}
        {list.length === 0 && "No games created till now"}
      </div>
    )
}

export default ExistingGamesList;