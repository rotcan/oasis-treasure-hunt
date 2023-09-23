import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { getInitTxnEncodedData } from "../../../../contract/txn";
import { BidType, GameState } from "../../../../utils/common";
import "../../../phaser/index";
import { EventBus, GameEvents } from "../../../phaser/scenes/main";
import BidDetails, { BidArgs } from "../Game/BidDetails";
import { Button } from "@mui/material";
import { ethers } from "ethers";
import WatchIcon from "@mui/icons-material/Watch";
import GamesIcon from "@mui/icons-material/Games";
import useLoading from "../useLoading";

interface StartGameArgs {
  moveCount: number;
  moveTimeout: number;
}
const StartGame = () => {
  const address = process.env.REACT_APP_CONTRACT_ADDRESS!;
  const { account, provider } = useWeb3React();
  const [startGameArgs, setStartGameArgs] = useState<StartGameArgs>({
    moveCount: 4,
    moveTimeout: 600,
  });
  const [bidArgs, setBidArgs] = useState<BidArgs>({
    bidAmount: "0",
    bidType: BidType.Free,
  });
  const {setLoading}=useLoading();
    
  
  useEffect(() => {
    //Reset pos

    window.p1GridPos = { x: 1, y: 1 };

    window.p2GridPos = { x: 1, y: 2 };

    EventBus.emit(
      GameEvents.Player1,
      window.p1GridPos.x,
      window.p1GridPos.y,
      window.p2GridPos.x,
      window.p2GridPos.y,
      GameState.Setup
    );
  }, []);

  const submitInitTxn = async () => {
    if (provider) {
      // const sgms=await provider.getSigner().signMessage("Test");
      const bidValue =
        !bidArgs.bidAmount || bidArgs.bidAmount === ""
          ? "0"
          : bidArgs.bidAmount;
      if (bidArgs.bidType === BidType.Free && bidValue !== "0") {
        alert("Bid Type is free but amount is not zero");
        return;
      }
      if (bidArgs.bidType !== BidType.Free && bidValue === "0") {
        alert("Bid Type is not free but amount is zero");
        return;
      }
      const encData = await getInitTxnEncodedData({
        args: {
          moveCount: startGameArgs.moveCount,
          moveTimeout: startGameArgs.moveTimeout,
          p1pos: { x: window.p1GridPos.x, y: window.p1GridPos.y },
          p2pos: { x: window.p2GridPos.x, y: window.p2GridPos.y },
          bidType: bidArgs.bidType,
        },
      });

      setLoading(true);
      try {
        const tx = await provider.getSigner().sendTransaction({
          from: account,
          data: encData,
          to: address!,
          value: ethers.toBigInt(bidValue) * ethers.toBigInt(1_000_000_000),
        });
        const res = await tx.wait();

        console.log("tx", tx, res.logs);
      } catch (error) {
        console.log("error", error);
      }
      setLoading(false);
            
    }
  };

  return (
    <>
      <div className="flexTableItem">
        <div className="flexTable">
          <div className="flexTableItem">Bid(Gwei)</div>
          <input
            className="flexTableItem"
            placeholder="Bid"
            onChange={(e) => {
              setBidArgs((current) => ({
                ...current,
                bidAmount: e.target.value,
                bidType: bidArgs.bidType,
              }));
            }}
            value={bidArgs.bidAmount}
          />
          <div
            className={
              "flexTableItem " +
              (bidArgs.bidType === BidType.Free ? "selectedBid" : "")
            }
          >
            <Button
              onClick={() => {
                setBidArgs((current) => ({
                  ...current,
                  bidType: BidType.Free,
                }));
              }}
            >
              0x
            </Button>
          </div>
          <div
            className={
              "flexTableItem " +
              (bidArgs.bidType === BidType.Half ? "selectedBid" : "")
            }
          >
            <Button
              onClick={() => {
                setBidArgs((current) => ({
                  ...current,
                  bidType: BidType.Half,
                }));
              }}
            >
              0.5x
            </Button>
          </div>
          <div
            className={
              "flexTableItem " +
              (bidArgs.bidType === BidType.Full ? "selectedBid" : "")
            }
          >
            <Button
              onClick={() => {
                setBidArgs((current) => ({
                  ...current,
                  bidType: BidType.Full,
                }));
              }}
            >
              1x
            </Button>
          </div>
          <div className="flexTableItem">
            <GamesIcon className="verticalAlignMiddle" />:
            <input
              className="width-50"
              placeholder="Move Count Limit"
              value={startGameArgs.moveCount}
              onChange={(e) => {
                setStartGameArgs((current) => ({
                  ...current,
                  moveCount: +e.target.value.replace(/\D/, ""),
                }));
              }}
            />
          </div>
          <div className="flexTableItem">
            <WatchIcon className="verticalAlignMiddle" />
            <input
              className="width-50"
              placeholder="Move Time Limit(s)"
              value={startGameArgs.moveTimeout}
              onChange={(e) => {
                setStartGameArgs((current) => ({
                  ...current,
                  moveTimeout: +e.target.value.replace(/\D/, ""),
                }));
              }}
            />
          </div>
          <div className="flexTableItem">
            <Button
              onClick={() => {
                submitInitTxn();
              }}
            >
              Submit Txn
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StartGame;
