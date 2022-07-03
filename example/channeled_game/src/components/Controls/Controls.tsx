import React, { useState, useEffect } from 'react';
import { Button } from '../Button/Button'
import styles from './Controls.module.css';

type ControlsProps = {
  balance: number,
  gameState: number,
  buttonState: any,
  betEvent: any,
  hitEvent: any,
  standEvent: any,
  resetEvent: any
};

const Controls: React.FC<ControlsProps> = ({ balance, gameState, buttonState, betEvent, hitEvent, standEvent, resetEvent }) => {
  const [amount, setAmount] = useState(10);
  const [inputStyle, setInputStyle] = useState(styles.input);

  useEffect(() => {
    validation();
  }, [amount, balance]);

  const validation = () => {
    if (amount > balance) {
      setInputStyle(styles.inputError);
      return false;
    }
    if (amount < 0.01) {
      setInputStyle(styles.inputError);
      return false;
    }
    setInputStyle(styles.input);
    return true;
  }

  const amountChange = (e: any) => {
    setAmount(e.target.value);
  }

  const onBetClick = () => {
    if (validation()) {
      betEvent(Math.round(amount * 100) / 100);
    }
  }

  if (gameState === 0) {
    return (
        <div className={styles.controlsContainer}>
          <label>Amount:
            <input
                id="amount"
                autoFocus
                type={'number'}
                min={0}
                value={amount}
                onChange={amountChange}
                className={inputStyle}
            />
          </label>
          <Button type={"secondary-alternative"} onClick={() => onBetClick()}>Bet</Button>
        </div>
    );
  }

  return (
      <div className={styles.controlsContainer}>
        <Button type={"secondary-alternative"} onClick={() => hitEvent()} disabled={buttonState.hitDisabled}>Hit</Button>
        <Button type={"secondary-alternative"} onClick={() => standEvent()} disabled={buttonState.standDisabled}>Stand</Button>
        <Button type={"secondary-alternative"} onClick={() => resetEvent()} disabled={buttonState.resetDisabled}>Reset</Button>
      </div>
  );
}

export default Controls;
