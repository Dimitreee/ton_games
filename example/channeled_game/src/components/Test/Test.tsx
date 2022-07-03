import React, {useRef} from 'react'
import {mnemonicToKeyPair, validateMnemonic} from "tonweb-mnemonic";


export const Login = () => {
    const messageInput1 = useRef<HTMLInputElement | null>(null)
    const messageInput2 = useRef<HTMLInputElement | null>(null)
    let keyPair1 = null
    let keyPair2 = null


    const handleSubmit1 = async (e: any) => {
        e.preventDefault();
        if (messageInput1.current) {
            const mnemonic = messageInput1.current.value.split(",");
            const isValid = await validateMnemonic(mnemonic);
            let keyPair = null;
            if (isValid) {
                keyPair = await mnemonicToKeyPair(mnemonic);
                keyPair1 = keyPair
            }

        }
    };

    const handleSubmit2 = async (e: any) => {
        e.preventDefault();
        if (messageInput1.current) {
            const mnemonic = messageInput1.current.value.split(",");
            const isValid = await validateMnemonic(mnemonic);
            let keyPair = null;
            if (isValid) {
                keyPair = await mnemonicToKeyPair(mnemonic);
                keyPair2 = keyPair
            }

        }
    };

    return (
        <div className="Token-container">
            <form action="" onSubmit={handleSubmit1}>
                <input type="text" ref={messageInput1}/>
                <button>
                    login
                </button>
            </form>
            <form action="" onSubmit={handleSubmit2}>
                <input type="text" ref={messageInput2}/>
                <button>
                    login
                </button>
            </form>
        </div>
    );
};
