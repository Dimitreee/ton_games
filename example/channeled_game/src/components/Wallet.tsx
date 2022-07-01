import React, {useEffect, useRef, useState} from 'react'
import TonWeb from "tonweb";
import {Address} from "cluster";

const BN = TonWeb.utils.BN;
const providerUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC';
const apiKey = '2c929a2d19741dc360559f0cc120547ad1042c6e21600bcaf5e4c645191f444e';
const tonweb = new TonWeb(new TonWeb.HttpProvider(providerUrl, {apiKey}));

interface IWalletProps {
    keyPair: any,
}


export const Wallet: React.FC<IWalletProps> = (props) => {
    const [wallet, setWallet] = useState<any>();
    useEffect(() => {
        const walletObj = tonweb.wallet.create({
            publicKey: props.keyPair.publicKey
        });
        walletObj.getAddress().then((wallet) => {
            setWallet(wallet)
        })
    }, [])


    return (
        <div className="Token-container">
            <div>{wallet}</div>
        </div>
    );
};
