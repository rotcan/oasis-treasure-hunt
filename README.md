# Deploying the contract

Run follwing command to deploy the contract 
```shell
PRIVATE_KEY="0x..." pnpm hardhat run scripts/run-maze.ts --network sapphire_testnet
```

# Deploying the frontend
Goto ./app folder and create the .env file with below variables
# Address we get after deploying the contract
REACT_APP_CONTRACT_ADDRESS={address}
# RPC Endpoint of sapphire testnet
REACT_APP_RPC_ENDPOINT=https://testnet.sapphire.oasis.dev
# Chain id of sapphire testnet
REACT_APP_SAPPHIRE_ID=0x5aff

# Running the frontend

Goto ./app folder and run the following command (considering npm is installed)

```shell
npm i
npm run start
```

# Game Details
Player1 hides a treasure chest in a 8x8 grid. The coordinates of the chest are stored in private variables. With Oasis Sapphire paratime, this information is not accessible outside unless few conditions are met (Game ends or Player1 sends a signed message proving their ownership)

To find the treasure, Player2 moves to different locations on grid. After each move program tells if player is nearer/farther/at same distance or at the treasure. This way they can guess their way to treasure

All information is stored on chain

