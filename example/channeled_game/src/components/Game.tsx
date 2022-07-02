import React, {useEffect, useState} from 'react'
import TonWeb from "tonweb";
import {Board} from "./Board";

const BN = TonWeb.utils.BN;
const providerUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC';
const apiKey = '';
const provider = new TonWeb.HttpProvider(providerUrl, {apiKey});
const tonweb = new TonWeb(provider);

interface IGameProps {
    keyPair: any
}


export const Game: React.FC<IGameProps> = (props) => {
    const [wallet, setWallet] = useState<any>();
    useEffect(() => {
        const walletObj = new tonweb.wallet.all.v3R2(provider, {
            publicKey: props.keyPair.publicKey,
        });
        walletObj.getAddress().then((wallet) => {
            setWallet(wallet)
        })
    }, []);
    let walletAddress = '';
    if (wallet) {
        walletAddress = wallet.toString(true, true, true)
    }

    return (
        <div className="Token-container">
            <div>{walletAddress ? <Board /> : null}</div>
        </div>
    );
};
