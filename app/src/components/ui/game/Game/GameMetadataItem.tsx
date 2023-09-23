import {
  ContractMetadata,
  GameMetadata,
  UnassignedAddress,
  getBidText,
  getGameStatus,
  getMoveCounterText,
  getNextMoveTime,
  getNumberValue,
  getStatus,
  getTimeLabel,
} from "../../../../contract/data";
import { GameState, Player } from "../../../../utils/common";
import { useCountdown } from "../../../../utils/countdown";
import CountdownTimer from "./CountdownTimer";
import MoveItems from "./MoveItems/Index";
import WatchIcon from "@mui/icons-material/Watch";
import GamesIcon from "@mui/icons-material/Games";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Copy from "./Copy";
import { formatEther } from "@ethersproject/units";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

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

  const countdownJSX = () => {
    if (status === GameState.Init) return CountdownTimer({ targetDate: time });
    return <></>;
  };

  const gameUrl =
    window.location.origin +
    "/" +
    window.PUBLIC_URL +
    `?gameId=${gameMetadata.game_index.toString()}`;
  const jsx = () => {
    if (gameMetadata.creator === UnassignedAddress)
      return <>Game has not been setup</>;
    return (
      <>
        <div className="flexTable width-90pct">
          {getStatus({ metadata: gameMetadata }) === GameState.Setup && (
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
            <div className="flexTableItem">
              <WatchIcon />
              {countdownJSX()}
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
          <div className="flexTableItem">
            <WatchIcon
              className="verticalAlignMiddle"
              titleAccess="Move time limit"
            />
            {getNumberValue(gameMetadata.move_time) / 60} mins
          </div>
          <div className="flexTableItem">
            <AttachMoneyIcon
              className="verticalAlignMiddle"
              titleAccess="Bid Amount"
            />
            {formatEther(depositMetadata.creator_deposit)}:
            {getBidText({ metadata: gameMetadata })}
          </div>
        </div>
      </>
    );
  };
  return jsx();
};

export default GameMetadataItem;
