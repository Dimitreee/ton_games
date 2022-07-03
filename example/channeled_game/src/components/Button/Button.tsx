import './Button.scss';
import React, { PropsWithChildren } from 'react'

interface IButtonProps extends PropsWithChildren {
    type?: "primary" | "secondary" | "secondary-alternative",
    onClick: () => void,
    disabled?: boolean;
}

export const Button: React.FC<IButtonProps> = (props) => {
    const { type = "primary", onClick, disabled } = props;

    return (
        <button
            className={`Button Button__${type}`}
            disabled={disabled}
            onClick={onClick}
        >
            {props.children}
        </button>
    )
}
