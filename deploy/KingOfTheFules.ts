// import hre from "hardhat";
import { ethers, network } from "hardhat";
import { Logger } from "tslog";
import "@nomiclabs/hardhat-ethers";
import { kingOfTheFulesArgs as args } from "../config/construct-arguments";
import { verify } from "../utils";

const log: Logger = new Logger();
const contractName = "KingOfTheFules";
const argValues = Object.values(args);

async function deploy() {
  log.info(`Deploying "${contractName}" on network: ${network.name}`);
  const deployContract = await ethers.getContractFactory(contractName);

  const kingOfTheFules = await deployContract.deploy(args.stakingToken);
  await kingOfTheFules.deployed();
  log.info(
    `"${contractName}" was successfully deployed on network: ${network.name}, address: ${kingOfTheFules.address}`
  );

  return {
    deployedAddr: kingOfTheFules.address,
  };
}

async function main() {
  const { deployedAddr } = await deploy();
  await verify({
    contractName,
    address: deployedAddr,
    constructorArguments: argValues,
    contractPath: "contracts/KingOfTheFules.sol:KingOfTheFules",
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
