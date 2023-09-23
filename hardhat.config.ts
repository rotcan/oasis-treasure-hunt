import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@oasisprotocol/sapphire-hardhat';

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks:{
    sapphire_testnet:{
      url: "https://testnet.sapphire.oasis.dev",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY]:[],
      chainId: 0x5aff,
    },
    emerald_testnet: {
      url: "https://testnet.emerald.oasis.dev",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
