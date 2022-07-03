import React, { PropsWithChildren } from 'react'
import styles from './Status.module.css';

interface IStatusProps extends PropsWithChildren {
    message: string,
    balance: number
};

const Status: React.FC<IStatusProps> = (props) => {
    const { message, balance, children } = props;

    return (
        <div className={styles.statusContainer}>
            <div className={styles.status}>
                <h2 className={styles.value}>{message}</h2>
                {children}
            </div>
            <div className={styles.balance}>
                <h4 className={styles.value}>Bank: ${balance}</h4>
            </div>
        </div>
    );
}

export default Status;
