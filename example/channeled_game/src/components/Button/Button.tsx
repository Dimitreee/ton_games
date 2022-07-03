import './Button.scss';
import React, { ButtonHTMLAttributes, ElementType, PropsWithChildren } from 'react'

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "secondary-alternative",
    onClick?: () => void,
    disabled?: boolean;
    type?: "submit";
}

export const Button: React.FC<IButtonProps> = (props) => {
    const { variant = "primary", onClick, disabled, type } = props;

    return (
        <button
            type={type}
            className={`Button Button__${variant}`}
            disabled={disabled}
            onClick={onClick}
        >
            {props.children}
        </button>
    )
}
