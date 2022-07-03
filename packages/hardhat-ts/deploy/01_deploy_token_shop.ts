import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { THardhatRuntimeEnvironmentExtended } from 'helpers/types/THardhatRuntimeEnvironmentExtended';

const func: DeployFunction = async (hre: THardhatRuntimeEnvironmentExtended) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const avocadoToken = await ethers.getContract('AvocadoToken', deployer);

  // Todo: deploy the vendor
  await deploy('AvocadoTokenShop', {
    from: deployer,
    args: [avocadoToken.address], // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    log: true,
  });

  const vendor = await ethers.getContract('AvocadoTokenShop', deployer);

  console.log('\n 🏵  Sending all 1000 tokens to the vendor...\n');
  await avocadoToken.transfer(vendor.address, ethers.utils.parseEther('1000'));
};
export default func;
func.tags = ['AvocadoTokenShop'];
