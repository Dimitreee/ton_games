import React, { PropsWithChildren, useContext, useEffect, useRef, useState } from 'react'
import TonWeb from 'tonweb'
import { KeyPair } from 'tonweb-mnemonic'
import { Address } from 'tonweb/dist/types/utils/address'
import { initialState, State } from '../../constants'
import { useTransport } from '../../utils/transport'

const utils = TonWeb.utils;

const providerUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC';
const apiKey = '2c929a2d19741dc360559f0cc120547ad1042c6e21600bcaf5e4c645191f444e';
const provider = new TonWeb.HttpProvider(providerUrl, {apiKey})
const tonweb = new TonWeb(provider);
const BN = TonWeb.utils.BN;
const toNano = TonWeb.utils.toNano;

interface ILiteNodeContext {
    channel?: any
    setWallet?: (wallet: any) => void,
    setKeyPair?: (keyPair: any) => void,
    keyPair?: any,
    wallet?: any
    serverState?: any
    isChannelOpen?: boolean
    closeChannel?: () => void
    changeUserBalance?: (nextBalance: any) => void
    changeDealerBalance?: (nextBalance: any) => void
}

const LiteNodeContext = React.createContext<ILiteNodeContext>({});

export const LiteNodeProvider: React.FC<PropsWithChildren> = (props) => {
    const channel = useRef()
    const [state, setState] = useState<State>(initialState)
    const { manager, initOffchain, initDapp, closeDappChannel, sign } = useTransport<State>()
    const [wallet, setWallet] = useState<Address>();
    const [isChannelOpen, setIsChannelOpen] = useState(false);
    const [keyPair, setKeyPair] = useState<KeyPair>();
    const secret = React.useRef<number | null>(null)

    useEffect(() => {
        manager.onStateChange((stateFromServer: any) => {
            const deck = typeof stateFromServer.deck === 'string' ? JSON.parse(stateFromServer.deck) : stateFromServer.deck

            setState((prevState: State) => {
                if (JSON.stringify(prevState) !== JSON.stringify(stateFromServer)) {
                    return { ...prevState, ...stateFromServer, deck }
                }

                return prevState
            })

            if (!stateFromServer?.channelId && stateFromServer?.userWalletAddress && stateFromServer?.userPublicKey) {
                secret.current = getRandomInt(1, 10000)
                manager.sendMessage("initChannel", secret.current)
            }

            if (stateFromServer?.channelId && !channel.current) {
                const brokerPublicKey = utils.base64ToBytes(stateFromServer.dealerPublicKey)
                const brokerWallet = new tonweb.wallet.all.v3R2(provider, {
                    // @ts-ignore
                    publicKey: brokerPublicKey,
                });

                brokerWallet.getAddress().then((brokerWalletAddress: any) => {
                    console.log(secret.current)
                    const channelId = new BN(secret.current)

                    const channelConfig = {
                        // @ts-ignore
                        channelId,
                        addressA: brokerWalletAddress,
                        addressB: wallet,
                        initBalanceA: toNano('1'),
                        initBalanceB: toNano('1'),
                    }
                    // @ts-ignore
                    const dAppChannel = tonweb.payments.createChannel({
                        ...channelConfig,
                        isA: false,
                        myKeyPair: keyPair,
                        // @ts-ignore
                        hisPublicKey: brokerPublicKey
                    });

                    channel.current = dAppChannel

                    dAppChannel.getAddress().then((address: any) => {
                        if (address.toString() !== stateFromServer.channelAddress) {
                            throw new Error('Channels address not same');
                        }

                        initOffchain()
                    })
                })
            }
        })
    })

    useEffect(() => {
        if (!wallet || !keyPair) {
            return;
        }

        manager.onOffChainInit((payload: any) => {
            const walletB = new tonweb.wallet.all.v3R2(provider, {
                publicKey: keyPair.publicKey,
            });
            // @ts-ignore
            const fromClient = channel.current?.fromWallet({
                wallet: walletB,
                secretKey: keyPair?.secretKey
            });

            console.log("offchain init: ", payload)
            console.log("from client init: ", fromClient)
            console.log("channel init state: ", state.channelState)

            fromClient
                .topUp({ coinsA: new BN(0), coinsB: toNano('1')})
                .send(toNano('1').add(toNano('0.05')));

            setTimeout(() => {
                console.log("\ninit Dapp")
                initDapp()
            }, 4000)
        })

        manager.onChanelOpen(() => {
            setIsChannelOpen(true)
        })
    }, [wallet, keyPair])

    useEffect(() => {
        if (!keyPair) {
            return;
        }

        const walletObj = new tonweb.wallet.all.v3R2(provider, {
            publicKey: keyPair.publicKey,
        });

        walletObj.getAddress().then((walletAddress) => {
            setWallet(walletAddress)

            manager.init({
                userWalletAddress: walletAddress,
                userPublicKey: utils.bytesToBase64(keyPair.publicKey)
            })
        })

    }, [keyPair])

    const closeChannel = () => {
        if (!channel.current) {
            return;
        }

        channel.current
            //@ts-ignore

            // Still not working yet :(
            // guess here some problems with signtaure
            .signClose({
                ...state.channelState,
            })
            .then((signature: any) => {
                console.log(signature)
                closeDappChannel(signature)
            });
    }

    const changeUserBalance = (balance: any) => {
        const dealerBalance = state.channelState.balanceA;
        const userBalance = state.channelState.balanceB;
        const nextDealerBalance = dealerBalance + userBalance - balance;
        const nextUserBalance = balance;

        let seqnoA = state.channelState.seqnoA;
        let seqnoB = state.channelState.seqnoB + 1;

        const nextChannelState = {
            balanceA: new BN(nextDealerBalance),
            balanceB: new BN(nextUserBalance),
            seqnoA: new BN(seqnoA),
            seqnoB: new BN(seqnoB)
        };

        // @ts-ignore
        channel.current?.signState(nextChannelState).then((signedState) => {
            console.log(signedState)
            sign({
                signedState,
                state: {
                    balanceA: new BN(nextDealerBalance).toNumber(),
                    balanceB: new BN(nextUserBalance).toNumber(),
                    seqnoA: new BN(seqnoA).toNumber(),
                    seqnoB: new BN(seqnoB).toNumber()
                }
            })
        });
    }

    const changeDealerBalance = (balance: any) => {
        // TODO: implement later
    }

    return (
        <LiteNodeContext.Provider
            value={{
                channel,
                setWallet,
                setKeyPair,
                keyPair,
                wallet,
                isChannelOpen,
                serverState: state,
                closeChannel,
                changeUserBalance,
                changeDealerBalance
            }}
        >
            {props.children}
        </LiteNodeContext.Provider>
    )
}

export const useLiteNodeContext = () => useContext(LiteNodeContext)

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
