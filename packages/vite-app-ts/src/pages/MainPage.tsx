import '~~/styles/main-page.css';
import { Spin, Switch as AntdSwitch } from 'antd';
import { Address } from 'eth-components/ant';
import { GenericContract } from 'eth-components/ant/generic-contract';
import { useBalance, useEthersAdaptorFromProviderOrSigners, useEventListener } from 'eth-hooks';
import { useEthersAppContext } from 'eth-hooks/context';
import { useDexEthPrice } from 'eth-hooks/dapps';
import { useTokenBalance } from 'eth-hooks/erc';
import { asEthersAdaptor } from 'eth-hooks/functions';
import React, { FC, useEffect, useState } from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';

import { MainPageFooter, MainPageHeader, createTabsAndRoutes, TContractPageList } from '../components/main';

import { useAppContracts, useConnectAppContracts, useLoadAppContracts } from '~common/components/context';
import { useCreateAntNotificationHolder } from '~common/components/hooks/useAntNotification';
import { useBurnerFallback } from '~common/components/hooks/useBurnerFallback';
import { useScaffoldAppProviders } from '~common/components/hooks/useScaffoldAppProviders';
import { DexComponent } from '~~/components/DexComponent';
import {
  BURNER_FALLBACK_ENABLED,
  CONNECT_TO_BURNER_AUTOMATICALLY,
  INFURA_ID,
  LOCAL_PROVIDER,
  MAINNET_PROVIDER,
  TARGET_NETWORK_INFO,
} from '~~/config/app.config';
import { AvocadoShop } from '~~/helpers/AvocadoShop';
import { formatEtherShort } from '~~/utils/formatEtherShort';

/** ********************************
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * See ./config/app.config.ts for configuration, such as TARGET_NETWORK
 * See ../common/src/config/appContracts.config.ts and ../common/src/config/externalContracts.config.ts to configure your contracts
 * See pageList variable below to configure your pages
 * See ../common/src/config/web3Modal.config.ts to configure the web3 modal
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * ******************************** */

/**
 * The main component
 * @returns
 */
export const MainPage: FC = () => {
  const notificationHolder = useCreateAntNotificationHolder();
  // -----------------------------
  // Providers, signers & wallets
  // -----------------------------
  // 🛰 providers
  // see useLoadProviders.ts for everything to do with loading the right providers
  const scaffoldAppProviders = useScaffoldAppProviders({
    targetNetwork: TARGET_NETWORK_INFO,
    connectToBurnerAutomatically: CONNECT_TO_BURNER_AUTOMATICALLY,
    localProvider: LOCAL_PROVIDER,
    mainnetProvider: MAINNET_PROVIDER,
    infuraId: INFURA_ID,
  });

  // 🦊 Get your web3 ethers context from current providers
  const ethersAppContext = useEthersAppContext();

  // if no user is found use a burner wallet on localhost as fallback if enabled
  useBurnerFallback(scaffoldAppProviders, BURNER_FALLBACK_ENABLED);

  // -----------------------------
  // Load Contracts
  // -----------------------------
  // 🛻 load contracts
  useLoadAppContracts();
  // 🏭 connect to contracts for mainnet network & signer
  const [mainnetAdaptor] = useEthersAdaptorFromProviderOrSigners(MAINNET_PROVIDER);
  useConnectAppContracts(mainnetAdaptor);
  // 🏭 connec to  contracts for current network & signer
  useConnectAppContracts(asEthersAdaptor(ethersAppContext));

  // -----------------------------
  // These are the contracts!
  // -----------------------------

  // init contracts
  const avocadoToken = useAppContracts('AvocadoToken', ethersAppContext.chainId);
  const avocadoTokenShop = useAppContracts('AvocadoTokenShop', ethersAppContext.chainId);
  const DEX = useAppContracts('DEX', ethersAppContext.chainId);

  const loading = !avocadoToken || !avocadoTokenShop || !DEX;
  // 📟 Listen for broadcast events
  const [ethToTokenEvents] = useEventListener(DEX, 'EthToToken', 0);
  const [tokenToEthEvents] = useEventListener(DEX, 'TokenToEth', 0);
  const [depositEvents] = useEventListener(DEX, 'Deposit', 0);

  const yourDepositEvents = depositEvents.filter((deposit) => deposit.args.buyer === ethersAppContext.account);
  console.log('depositEvents', depositEvents, yourDepositEvents);
  // -----------------------------
  // .... 🎇 End of examples
  // -----------------------------
  // 💵 This hook will get the price of ETH from 🦄 Uniswap:
  const [ethPrice] = useDexEthPrice(
    scaffoldAppProviders.mainnetAdaptor?.provider,
    ethersAppContext.chainId !== 1 ? scaffoldAppProviders.targetNetwork : undefined
  );

  // 💰 this hook will get your balance
  const [yourBalance, updateYourBalance] = useBalance(ethersAppContext.account);
  const [yourTokenBalance, updateYourTokenBalance] = useTokenBalance(avocadoToken!, ethersAppContext.account ?? '');
  const [dexBalance, updateDexBalance] = useBalance(DEX?.address);
  const [dexTokenBalance, updateDexTokenBalance] = useTokenBalance(avocadoToken!, DEX?.address!);

  const updateAllBalances = async () => {
    updateDexBalance();
    updateDexTokenBalance();
    updateYourBalance();
    updateYourTokenBalance();
  };

  useEffect(() => {
    updateAllBalances();
  }, [ethToTokenEvents.length, depositEvents.length, tokenToEthEvents.length]);

  const [route, setRoute] = useState<string>('');
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  const dexElement = (
    <Spin spinning={loading} tip="Loading...">
      <DexComponent
        dexAddress={
          DEX ? (
            <Address address={DEX.address} blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer} />
          ) : (
            <div>Loading...</div>
          )
        }
        dexBalance={dexBalance}
        dexTokensBalance={dexTokenBalance}
        userBalance={yourBalance}
        userTokensBalance={yourTokenBalance}
        updateAllBalances={updateAllBalances}
      />
    </Spin>
  );
  // -----------------------------
  // 📃 App Page List
  // -----------------------------
  const pageList: TContractPageList = {
    mainPage: {
      name: 'AvocadoToken',
      content: (
        <GenericContract
          contractName="AvocadoToken"
          contract={avocadoToken}
          mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
          blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
        />
      ),
    },
    pages: [
      {
        name: 'AvocadoTokenShop',
        content: (
          <GenericContract
            contractName="AvocadoTokenShop"
            contract={avocadoTokenShop}
            mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
            blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}></GenericContract>
        ),
      },
      {
        name: 'DEX',
        content: (
          <GenericContract
            contractName="DEX"
            contract={DEX}
            mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
            blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
          />
        ),
      },
      {
        name: 'DexComponent',
        content: dexElement,
      },
    ],
  };
  const { routeContent: tabContents, tabMenu } = createTabsAndRoutes(pageList, route, setRoute);

  const [debugMode, setDebugMode] = useState(false);
  const debugModeSwitcher = (
    <AntdSwitch
      checked={debugMode}
      onChange={(checked) => setDebugMode(checked)}
      checkedChildren={'Debug on'}
      unCheckedChildren={'Debug off'}
    />
  );

  return (
    <div className="App">
      <MainPageHeader scaffoldAppProviders={scaffoldAppProviders} price={ethPrice} />
      <div className={'flex space-between'}>
        <AvocadoShop scaffoldAppProviders={scaffoldAppProviders} />
        <div className={'w-400 h-200 p-4 border border-2 rounded-2xl border-green-600'}>
          <span className={'base-text text-lg'}>Your avocados: {formatEtherShort(yourTokenBalance)} 🥑</span>
        </div>
      </div>
      {debugMode ? (
        <BrowserRouter>
          {tabMenu}
          <Switch>{tabContents}</Switch>
        </BrowserRouter>
      ) : (
        dexElement
      )}

      <MainPageFooter
        scaffoldAppProviders={scaffoldAppProviders}
        price={ethPrice}
        debugModeSwitcher={debugModeSwitcher}
      />
      <div style={{ position: 'absolute' }}>{notificationHolder}</div>
    </div>
  );
};
