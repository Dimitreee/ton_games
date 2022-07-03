import React, { PropsWithChildren } from 'react'
import { Button } from '../Button/Button'
import { useLiteNodeContext } from '../LiteNodeProvider/LiteNodeProvider'
import styles from './Status.module.css';

interface IStatusProps extends PropsWithChildren {
    message: string,
};

const Status: React.FC<IStatusProps> = (props) => {
    const { closeChannel, serverState } = useLiteNodeContext();
    const { message, children } = props;

    console.log(serverState.channelState)

    return (
        <div className={styles.statusContainer}>
            <div className={styles.status}>
                <h2 className={styles.value}>{message}</h2>
                {children}
            </div>
            <div className={styles.balance}>
                <h4 className={styles.value}>Bank: ${serverState.channelState.balanceB}</h4>
                <Button variant={"secondary"} onClick={closeChannel}>
                    Withdraw
                </Button>
            </div>
        </div>
    );
}

export default Status;
