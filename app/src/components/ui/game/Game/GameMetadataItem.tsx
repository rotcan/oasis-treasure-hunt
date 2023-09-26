import { formatEther } from "@ethersproject/units";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import GamesIcon from "@mui/icons-material/Games";
import WatchIcon from "@mui/icons-material/Watch";
import { useWeb3React } from "@web3-react/core";
import {
  ContractMetadata,
  UnassignedAddress,
  getBidText,
  getGameStatus,
  getMoveCounterText,
  getNextMoveTime,
  getNumberValue,
  getPlayer2BidAmount,
  getStatus,
  getTimeLabel,
  getWinningAmount,
  isGameSetup,
  isPlayer2Join
} from "../../../../contract/data";
import { GameState, Player } from "../../../../utils/common";
import PlayerJoin from "../Txn/PlayerJoin";
import PlayerMove from "../Txn/PlayerMove";
import Copy from "./Copy";
import CountdownTimer from "./CountdownTimer";
import MoveItems from "./MoveItems/Index";

const GameMetadataItem = ({
  data,
  player,
}: {
  data: ContractMetadata;
  player: Player;
}) => {
  ///Show time
  ///Show staus
  ///Show move count
  const { gameMetadata, moveMetadatas, depositMetadata } = data;
  const statusText = getGameStatus({ metadata: gameMetadata });
  const timeLabel = getTimeLabel({ metadata: gameMetadata });
  const time = getNextMoveTime({ metadata: gameMetadata });
  const status = getStatus({ metadata: gameMetadata });
  const moveCounterText = getMoveCounterText({ metadata: gameMetadata });
  const {account}=useWeb3React();

  const countdownJSX = () => {
    if (status === GameState.Init) return CountdownTimer({ targetDate: time });
    return <></>;
  };

  const isCreator=():boolean=>{
    return gameMetadata.creator===account;
  }

  const player2ActionJsx=()=>{
        
    if(!gameMetadata || !gameMetadata.game_index || getStatus({metadata:gameMetadata})===GameState.End)
        return <></>
    if(!isGameSetup({metadata: gameMetadata}))
        return <></>
    if(isPlayer2Join({metadata: gameMetadata}) )
        return (<PlayerJoin gameIndex={gameMetadata.game_index.toString()} amount={getPlayer2BidAmount({deposit: depositMetadata,metadata: gameMetadata})}/>   )
    return (<PlayerMove gameIndex={gameMetadata.game_index.toString()}/>   )
}

  const gameUrl =
    window.location.origin +
    "" +
    window.PUBLIC_URL +
    `?gameId=${gameMetadata.game_index.toString()}`;
  const jsx = () => {
    if (gameMetadata.creator === UnassignedAddress)
      return <>Game has not been setup</>;
    return (
      <>
        <div className={(isCreator() ? `flexTable minWidth600`: `flexTable minWidth400`)}>
          {getStatus({ metadata: gameMetadata }) === GameState.Setup
          && isCreator() && (
            <>
              <div className="flexTableItem verticalAlignMiddle">
                <span>{statusText}</span>
                <a href={gameUrl} target="_blank">Link</a>
                <Copy str={gameUrl} />
              </div>
              <div className="flexTableItem">
                  <AccountCircleIcon
                    titleAccess="Other player"
                    className="verticalAlignMiddle"
                  />
                  :{" "}
                  {gameMetadata.player2 !== UnassignedAddress
                    ? gameMetadata.player2
                    : "None"}
                </div>
              {/* <div className="flexTable">
                
                <div className="flexTableItem">
                {timeLabel}:{time.toLocaleString()}
              </div> 
              </div> */}
            </>
          )}
          {getStatus({ metadata: gameMetadata }) === GameState.Init && (
            <div className="flexTableItem flexTable">
              <div className="flexTableItem">
              <WatchIcon />
              </div>
              <div className="flexTableItem">
              {countdownJSX()}
              </div>
            </div>
          )}
          <div className="flexTableItem">
            <GamesIcon
              className="verticalAlignMiddle"
              titleAccess="Move Count"
            />
            {moveCounterText}
          </div>
          <MoveItems metadatas={moveMetadatas} />
          {moveMetadatas.length===0 && (
          <div className="flexTableItem">
            <WatchIcon
              className="verticalAlignMiddle"
              titleAccess="Move time limit"
            />
            {getNumberValue(gameMetadata.move_time) / 60} mins
          </div>
          )}
          {depositMetadata.creator_deposit.toString()!=="0" && (
          <div className="flexTableItem" title={`Bid of ${formatEther(depositMetadata.creator_deposit)} required. Winning amount=${formatEther(getWinningAmount({metadata: gameMetadata,deposit: depositMetadata}))}`}>
            <AttachMoneyIcon
              className="verticalAlignMiddle"
            />
            {formatEther(depositMetadata.creator_deposit)}:
            {getBidText({ metadata: gameMetadata })}
          </div>
          )}
          {
            //Show all moves
            gameMetadata.game_index.toString() && !isCreator() && (
                //Show join or move depending one state
                
                //Options to make move and submit them
                <div className="flexTableItem">
                {player2ActionJsx()}
                </div>
            )
        }
        </div>
      </>
    );
  };
  return jsx();
};

export default GameMetadataItem;
