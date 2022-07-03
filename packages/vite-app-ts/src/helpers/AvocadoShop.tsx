import { Address } from 'eth-components/ant';
import { useEthersAppContext } from 'eth-hooks/context';
import { useTokenBalance } from 'eth-hooks/erc';
import { formatEther } from 'ethers/lib/utils';
import React, { FC } from 'react';

import { useAppContracts } from '~common/components/context';
import { useInputForm } from '~~/components/hooks/useInputForm';
import { formatEtherShort } from '~~/utils/formatEtherShort';

type Props = {
  scaffoldAppProviders: any;
};
export const AvocadoShop: FC<Props> = ({ scaffoldAppProviders }) => {
  const ethersAppContext = useEthersAppContext();
  const avocadoToken = useAppContracts('AvocadoToken', ethersAppContext.chainId);

  const avocadoTokenShop = useAppContracts('AvocadoTokenShop', ethersAppContext.chainId);
  const [shopTokenBalance, updateShopTokenBalance] = useTokenBalance(avocadoToken!, avocadoTokenShop?.address!);

  const { element: inputForm, value } = useInputForm({
    label: 'Buy avocados',
    onSubmit: async (value) => {
      if (!avocadoTokenShop) {
        return;
      }
      await avocadoTokenShop.buyTokens({ value });
      updateShopTokenBalance();
    },
  });

  return (
    <div className={'w-400 h-200 p-4 border border-2 rounded-2xl border-green-600 bg-lime-50 m-3'}>
      <span className={'text-4xl strong'}>Shop</span>
      <span className={'text-lg px-10'}> {formatEtherShort(shopTokenBalance)} 🥑</span>
      <Address address={avocadoTokenShop?.address} blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer} />
      {inputForm}
      {parseFloat(value) < 1 && <span>Enter valid amount of eth</span>}
      {value && parseFloat(value) >= 1 && (
        <span>You will get {parseFloat(formatEther(value)) * AVOCADOS_PER_ETH} 🥑</span>
      )}
    </div>
  );
};

const AVOCADOS_PER_ETH = 100;
