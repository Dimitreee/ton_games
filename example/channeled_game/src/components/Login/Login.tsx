import React, { useRef } from 'react'
import "./Login.scss"
import {
    mnemonicToKeyPair,
    validateMnemonic,
} from "tonweb-mnemonic";
import { Button } from '../Button/Button'
import { useLiteNodeContext } from '../LiteNodeProvider/LiteNodeProvider'

export const Login: React.FC = () => {
    const { setKeyPair } = useLiteNodeContext();

    const messageInput = useRef<HTMLInputElement | null>(null);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (messageInput.current) {
            const mnemonic = messageInput.current.value.split(",");
            const isValid = await validateMnemonic(mnemonic);

            let keyPair = null;

            if (isValid) {
                keyPair = await mnemonicToKeyPair(mnemonic);

                if (setKeyPair) {
                    setKeyPair(keyPair)
                }
            }
        }
    };

    return (
        <div className="TokenContainer">
            <form action="" onSubmit={handleSubmit}>
                <label>
                    <span>Enter seed phrase</span>
                    <input type="text" ref={messageInput}/>
                </label>
                <Button variant={"primary"} type={"submit"}>
                    Login
                </Button>
            </form>
        </div>
    );
};
