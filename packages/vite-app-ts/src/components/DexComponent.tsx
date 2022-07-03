import { BigNumber } from '@ethersproject/bignumber';
import { notification } from 'antd';
import { useEthersAppContext } from 'eth-hooks/context';
import { formatEther } from 'ethers/lib/utils';
import React, { FC, ReactElement } from 'react';

import Curve from './Curve';

import { useAppContracts } from '~common/components/context';
import { useInputForm } from '~~/components/hooks/useInputForm';
import { formatEtherShort } from '~~/utils/formatEtherShort';

type Props = {
  dexAddress: ReactElement;
  dexBalance: BigNumber;
  dexTokensBalance: BigNumber;
  // TODO maybe usefull for show max in inputs
  userBalance: BigNumber;
  userTokensBalance: BigNumber;
  updateAllBalances: VoidFunction;
};

export const DexComponent: FC<Props> = ({
  dexBalance,
  dexAddress,
  userBalance,
  userTokensBalance,
  updateAllBalances,
  dexTokensBalance,
}) => {
  const ethersAppContext = useEthersAppContext();

  const DEX = useAppContracts('DEX', ethersAppContext.chainId);
  const tokenContract = useAppContracts('AvocadoToken', ethersAppContext.chainId);

  const ethToToken = async (value: string) => {
    if (!tokenContract || !DEX) {
      return;
    }
    await DEX.ethToToken({ value });
    showTransactionSentNotification();
  };

  const tokenToEth = async (value: string) => {
    if (!tokenContract || !DEX) {
      return;
    }
    await tokenContract.approve(DEX.address, value);
    await DEX.tokenToEth(value);
    showTransactionSentNotification();
  };

  const withdraw = async (value: string) => {
    if (!DEX) {
      return;
    }
    DEX && DEX.withdraw(value);
    showTransactionSentNotification();
  };

  const deposit = async (value: string) => {
    if (!tokenContract || !DEX) {
      return;
    }

    const forApprove = dexTokensBalance.mul(BigNumber.from(value)).div(dexBalance).add(1);
    await tokenContract.approve(DEX.address, forApprove);
    await DEX.deposit({ value });
    showTransactionSentNotification();
  };

  const { element, value } = useInputForm({ label: 'Eth to avocados', onSubmit: ethToToken });
  const { element: element2, value: value2 } = useInputForm({ label: 'Avocados to eth', onSubmit: tokenToEth });
  const { element: withdrawElement, value: withdrawValue } = useInputForm({
    label: 'Withdraw (🥑)',
    onSubmit: withdraw,
  });
  const { element: depositElement, value: depositValue } = useInputForm({ label: 'Deposit (🔷)', onSubmit: deposit });

  const tokensForDeposit =
    dexBalance.isZero() || !depositValue || parseFloat(depositValue) < 1
      ? 0
      : dexTokensBalance.mul(BigNumber.from(depositValue)).div(dexBalance).add(1);

  return (
    <div className={'bg-slate-100 justify-center max-w-1000 rounded-xl p-8 dark:bg-slate-800 m-3'}>
      <div className={'mb-4'}>
        <div>
          <span className={'text-4xl strong'}>DEX</span>
          <span className={'text-base pl-10 pr-2'} title={formatEther(dexTokensBalance)}>
            🥑 {formatEtherShort(dexTokensBalance)}
          </span>
          <span className={'text-base pl-2 pr-10'} title={formatEther(dexBalance)}>
            🔷 {formatEtherShort(dexBalance)}
          </span>
          {dexAddress}
        </div>
        <div></div>
      </div>
      <div className={'flex'}></div>
      <div>
        <div className={'flex place-content-center space-x-10'}>
          <div>
            {element}
            {element2}
            {depositElement}
            Tokens for deposit: {formatEtherShort(tokensForDeposit, 4)}
            {withdrawElement}
          </div>
          <Curve
            addingEth={parseFloat(value) >= 1 ? parseFloat(formatEther(value)) : 0}
            addingToken={parseFloat(value2) >= 1 ? parseFloat(formatEther(value2)) : 0}
            ethReserve={parseFloat(formatEther(dexBalance))}
            tokenReserve={parseFloat(formatEther(dexTokensBalance))}
            width={300}
            height={300}
          />
        </div>
      </div>
    </div>
  );
};

const showTransactionSentNotification = () => {
  notification.info({
    message: 'Transaction sent',
    placement: 'bottomRight',
  });
};
