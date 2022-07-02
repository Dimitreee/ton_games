import React, {useEffect, useState} from 'react'
import TonWeb from "tonweb";

const BN = TonWeb.utils.BN;
const providerUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC';
const apiKey = '';
const provider = new TonWeb.HttpProvider(providerUrl, {apiKey});
const tonweb = new TonWeb(provider);

interface IWalletProps {
    keyPair: any,
}


export const Wallet: React.FC<IWalletProps> = (props) => {
    const [wallet, setWallet] = useState<any>();
    useEffect(() => {
        const walletObj = new tonweb.wallet.all.v3R2(provider, {
            publicKey: props.keyPair.publicKey,
        });
        walletObj.getAddress().then((wallet) => {
            setWallet(wallet)
        })
    }, [])

    return (
        <div className="Token-container">
            <div>{wallet ? wallet.toString(true, true, true) : null}</div>
        </div>
    );
};
