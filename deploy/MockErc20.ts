// import hre from "hardhat";
import { ethers, network } from "hardhat";
import { Logger } from "tslog";
import "@nomiclabs/hardhat-ethers";
import { mockERC20Args as args } from "../config/construct-arguments";
import { verify } from "../utils";

const log: Logger = new Logger();
const contractName = "MockERC20";
const argValues = Object.values(args);

async function deploy() {
  log.info(`Deploying "${contractName}" on network: ${network.name}`);

  const deployContract = await ethers.getContractFactory(contractName);
  const token = await deployContract.deploy(
    args.name,
    args.symbol,
    args.initialSupply
  );
  await token.deployed();

  log.info(
    `"${contractName}" was successfully deployed on network: ${network.name}, address: ${token.address}`
  );

  return {
    deployedAddr: token.address,
  };
}

async function main() {
  const { deployedAddr } = await deploy();
  await verify({
    contractName,
    address: deployedAddr,
    constructorArguments: argValues,
    contractPath: "contracts/mock/MockERC20.sol:MockERC20",
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
