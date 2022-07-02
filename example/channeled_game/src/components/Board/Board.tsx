import React, { useEffect } from 'react'
import TonWeb from "tonweb";
import {useTransport} from "../../utils/transport";
import {State} from "../../constants";
import {BlackJack} from "../BlackJack/BlackJack";

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
        <BlackJack />
    )
}
