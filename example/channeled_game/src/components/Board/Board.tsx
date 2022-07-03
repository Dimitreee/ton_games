import React, {useEffect, useRef, useState} from 'react'
import TonWeb from "tonweb";
import {useTransport} from "../../utils/transport";
import {State} from "../../constants";
import {BlackJack} from "../BlackJack/BlackJack";

const utils = TonWeb.utils;

const providerUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC';
const apiKey = '2c929a2d19741dc360559f0cc120547ad1042c6e21600bcaf5e4c645191f444e';
const provider = new TonWeb.HttpProvider(providerUrl, {apiKey})
const tonweb = new TonWeb(provider);
const BN = TonWeb.utils.BN;
const toNano = TonWeb.utils.toNano;

interface IBoardProps {
    keyPair: any,
    walletAddress: any,
}

export const Board: React.FC<IBoardProps> = (props) => {
    const [state, setState] = useState()
    const channel = useRef()
    const { manager } = useTransport<State>()
    const {
        keyPair,
        walletAddress,
    } = props;

    useEffect(() => {
        manager.onStateChange((stateFromServer: any) => {
            console.log('state from server')
            console.log(stateFromServer)
            setState(stateFromServer)
        })
        manager.init({
            userWalletAddress: walletAddress,
            userPublicKey: utils.bytesToBase64(keyPair.publicKey)
        })
    }, [])

    useEffect(() => {
        console.log(state)
        // @ts-ignore
        if (!state?.channelId && state?.userWalletAddress && state?.userPublicKey) {
            manager.sendMessage("initChannel")
        }
        // @ts-ignore
        if (state?.channelId && !channel.current) {
            const channelInitState = {
                balanceA: toNano('3'), // A's initial balance in Toncoins. Next A will need to make a top-up for this amount
                balanceB: toNano('3'), // B's initial balance in Toncoins. Next B will need to make a top-up for this amount
                seqnoA: new BN(0), // initially 0
                seqnoB: new BN(0)  // initially 0
            };
            const brokerWallet = new tonweb.wallet.all.v3R2(provider, {
                // @ts-ignore
                publicKey: state.dealerPublicKey,
            });
            brokerWallet.getAddress().then((brokerWalletAddress: any) => {
                const channelConfig = {
                    // @ts-ignore
                    channelId: new BN(state?.channelId), // Channel ID, for each new channel there must be a new ID
                    addressA: brokerWalletAddress, // A's funds will be withdrawn to this wallet address after the channel is closed
                    addressB: userWalletAddress, // B's funds will be withdrawn to this wallet address after the channel is closed
                    initBalanceA: channelInitState.balanceA,
                    initBalanceB: channelInitState.balanceB
                }

                const channel = tonweb.payments.createChannel({
                    ...channelConfig,
                    isA: false,
                    myKeyPair: keyPair,
                    hisPublicKey: state.dealerPublicKey
                });
            })

        }

    }, [state])

    return (
        <BlackJack />
    )
}
