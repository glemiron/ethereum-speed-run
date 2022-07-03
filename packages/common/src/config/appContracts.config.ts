/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { createConnectorForHardhatContract } from 'eth-hooks/context';
import { invariant } from 'ts-invariant';

import * as hardhatContracts from '~common/generated/contract-types';
import hardhatContractsJson from '~common/generated/hardhat_contracts.json';

/**
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * ### Instructions
 * 1. edit externalContracts.config.ts to add your external contract addresses.
 * 2. edit `appContractsConfig` function below and add them to the list
 * 3. run `yarn contracts:build` to generate types for contracts
 * 4. run `yarn deploy` to generate hardhat_contracts.json
 *
 * ### Summary
 * - called  by useAppContracts
 * @returns
 */
export const appContractsConfig = () => {
  try {
    const result = {
      // --------------------------------------------------
      // 🙋🏽‍♂️ Add your hadrdhat contracts here
      // --------------------------------------------------
      AvocadoToken: createConnectorForHardhatContract(
        'AvocadoToken',
        hardhatContracts.AvocadoToken__factory,
        hardhatContractsJson
      ),

      AvocadoTokenShop: createConnectorForHardhatContract(
        'AvocadoTokenShop',
        hardhatContracts.AvocadoTokenShop__factory,
        hardhatContractsJson
      ),

      // --------------------------------------------------
      // 🙋🏽‍♂️ Add your external contracts here, make sure to define the address in `externalContractsConfig.ts`Í
      // --------------------------------------------------
      DEX: createConnectorForHardhatContract('DEX', hardhatContracts.DEX__factory, hardhatContractsJson),
    } as const;

    return result;
  } catch (e) {
    invariant.error(
      '❌ appContractsConfig: ERROR with loading contracts please run `yarn contracts:build or yarn contracts:rebuild`.  Then run `yarn deploy`!'
    );
    invariant.error(e);
  }

  return undefined;
};
