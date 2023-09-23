// Usage: pnpm hardhat run --network <network> scripts/run-vigil.ts
//PRIVATE_KEY="0x..." pnpm hardhat run scripts/run-vigil.ts --network sapphire_testnet
import { ethers } from 'hardhat';
require('dotenv').config();

async function deploy(){
    const [deployer, account] = await ethers.getSigners();
  const Maze = await ethers.getContractFactory('Maze');
  const maze = await Maze.deploy();
  await maze.deployed();
  console.log('Maze deployed to:', maze.address);
}


async function initGame() {
    const address=process.env.CONTRACT_ADDRESS!;
    const url=process.env.RPC_ENDPOINT!;
    const jsonRpc=new ethers.providers.JsonRpcProvider(url);
    var wallet=new ethers.Wallet(process.env.PLAYER1!);
    wallet=wallet.connect(jsonRpc);
    
    const Maze=await ethers.getContractFactory("Maze",wallet);
    console.log("address",address);
    const maze = await Maze.attach(address);
    
    const tx=await maze.initGame({x:ethers.BigNumber.from("4"),y:ethers.BigNumber.from("7")},
    {x:ethers.BigNumber.from("2"),y:ethers.BigNumber.from("1")},
    ethers.BigNumber.from("4"),ethers.BigNumber.from("180"),ethers.BigNumber.from("0"));
    console.log("tx hash",tx.hash);
   
    await tx.wait();
    console.log("tx",tx); 
    //init game
 
}

async function joinGame(gameIndex: string){
    const address=process.env.CONTRACT_ADDRESS!;
    const url=process.env.RPC_ENDPOINT!;
    const jsonRpc=new ethers.providers.JsonRpcProvider(url);
    var wallet=new ethers.Wallet(process.env.PLAYER2!);
    wallet=wallet.connect(jsonRpc);
    
    const Maze=await ethers.getContractFactory("Maze",wallet);
    const maze = await Maze.attach(address);
    
    const tx=await maze.joinGame(ethers.BigNumber.from(gameIndex));
    console.log("tx hash",tx.hash);
   
    await tx.wait();
    console.log("tx",tx); 
}


async function playerMove(gameIndex: string, px: number,py: number){
    const address=process.env.CONTRACT_ADDRESS!;
    const url=process.env.RPC_ENDPOINT!;
    const jsonRpc=new ethers.providers.JsonRpcProvider(url);
    var wallet=new ethers.Wallet(process.env.PLAYER2!);
    wallet=wallet.connect(jsonRpc);
    
    const Maze=await ethers.getContractFactory("Maze",wallet);
    const maze = await Maze.attach(address);
    
    const tx=await maze.playerMove(ethers.BigNumber.from(gameIndex),{x: ethers.BigNumber.from(px),
    y: ethers.BigNumber.from(py)});
    console.log("tx hash",tx.hash);
   
    await tx.wait();
    console.log("tx",tx); 
}

const readTx=async(txId: string)=>{
    const maze = await ethers.getContractFactory('Maze');
    const data=await ethers.provider.getTransaction(txId);
    // console.log("data ",vigil.interface,data.data,data.value);
    let decodedData=maze.interface.parseTransaction({data: data.data,value:data.value});
    console.log("d",decodedData);
}

const readData=async(gameIndex:string,moveIndex?: string)=>{
    const address=process.env.CONTRACT_ADDRESS!;
    const url=process.env.RPC_ENDPOINT!;
    const jsonRpc=new ethers.providers.JsonRpcProvider(url);
    var wallet=new ethers.Wallet(process.env.PLAYER2!);
    wallet=wallet.connect(jsonRpc);
    
    const Maze=await ethers.getContractFactory("Maze",wallet);
    const maze = await Maze.attach(address);
    const data=await maze._gameMetadatas(ethers.BigNumber.from(gameIndex));
    console.log("data",data);
    const d2=await maze.getMoveData(ethers.BigNumber.from(gameIndex),
    moveIndex ?? ethers.BigNumber.from(data.current_move_counter-1) );
    console.log("d2",d2);
}

deploy().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
// readData("0").catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
// joinGame("0").catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });

// playerMove("0",3,8).catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });