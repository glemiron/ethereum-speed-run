import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { THardhatRuntimeEnvironmentExtended } from 'helpers/types/THardhatRuntimeEnvironmentExtended';

const func: DeployFunction = async (hre: THardhatRuntimeEnvironmentExtended) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const myToken = await ethers.getContract('AvocadoToken', deployer);

  await deploy('DEX', {
    from: deployer,
    args: [myToken.address],
    log: true,
  });
};

export default func;
func.tags = ['DEX'];
