import React, {useRef, useState} from 'react'
import {mnemonicToKeyPair, validateMnemonic} from "tonweb-mnemonic";



interface ILoginProps {
    setLoginHidden: (isLoginHidden: boolean) => void,
    setKeyPair: (keyPair: any) => void
}


export const Login: React.FC<ILoginProps> = ({setLoginHidden, setKeyPair, ...rest}) => {
    const messageInput = useRef<HTMLInputElement | null>(null)
    const handleSubmit = async (e: any) => {
        e.preventDefault()
        if (messageInput.current) {
            const mnemonic = messageInput.current.value.split(",");
            const isValid = await validateMnemonic(mnemonic);
            let keyPair = null;
            if (isValid) {
                keyPair = await mnemonicToKeyPair(mnemonic);
                setLoginHidden(true)
                setKeyPair(keyPair)
            }

        }
    };
    return (
        <div className="Token-container">
            <form action="" onSubmit={handleSubmit}>
                <input type="text" ref={messageInput}/>
                <button>
                    sendMessage
                </button>
            </form>
        </div>
    );
};
