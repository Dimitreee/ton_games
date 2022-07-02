import React, { useEffect } from 'react'
import { BlackJack } from './BlackJack'
import { useTransport } from '../utils/transport'
import {State} from "../constants";
import TonWeb from "tonweb";

const utils = TonWeb.utils;

interface IBoardProps {
    keyPair: any,
    walletAddress: any,
}

export const Board: React.FC<IBoardProps> = (props) => {
    const { manager } = useTransport<State>()
    const {
        keyPair,
        walletAddress,
    } = props;

    manager.init({
        userWalletAddress: walletAddress,
        userPublicKey: utils.bytesToBase64(keyPair.publicKey)
    })

    return (
        <div>
            <BlackJack />
        </div>
    )
}
