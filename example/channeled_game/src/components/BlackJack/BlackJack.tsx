import React, { useEffect, useState } from 'react'
import styles from './BlackJack.module.css'
import { Deal, GameState, initialState, Message, State } from '../../constants'
import { useTransport } from '../../utils/transport'
import Controls from '../Controls/Controls'
import Hand from '../Hand/Hand'
import Status from '../Status/Status'

export const BlackJack: React.FC = () => {
  const { setUpdate, manager, resetState } = useTransport<State>()
  const [state, setState]  = useState<State>(initialState)

  const {
    deck,
    userCards,
    userScore,
    userCount,
    dealerCards,
    dealerScore,
    dealerCount,
    balance,
    bet,
    gameState,
    message,
    buttonState,
  } = state;

  useEffect(() => {
    manager.onStateChange((state: State) => {
      const deck = typeof state.deck === 'string' ? JSON.parse(state.deck) : state.deck

      setState((prevState: State) => {
        if (JSON.stringify(prevState) !== JSON.stringify(state)) {
          return {...prevState, ...state, deck }
        }

        return prevState
      })
    })
  }, [])

  useEffect(() => {
    if (gameState === undefined) {
      return;
    }

    if (gameState === GameState.init) {
      drawCard(Deal.user);
      drawCard(Deal.hidden);
      drawCard(Deal.user);
      drawCard(Deal.dealer);

      setUpdate({
        gameState: GameState.userTurn,
        message: Message.hitStand
      })
    }
  }, [gameState]);

  const updateDealerCards = () => {
    if (dealerCards === undefined) {
      return;
    }

    calculate(
        dealerCards,
        (dealerScore: number) => setUpdate({ dealerScore })
    );

    setUpdate({ dealerCount: dealerCount + 1 })
  }

  const updateUserCards = () => {
    if (userCards === undefined) {
      return;
    }

    calculate(
        userCards,
        (userScore: number) => setUpdate({ userScore })
    );

    setUpdate({ userCount: userCount + 1 });
  }

  useEffect(() => {
    if (userCount === undefined) {
      return;
    }

    if (gameState === GameState.userTurn) {
      if (userScore === 21) {
        buttonState.hitDisabled = true;
        setUpdate({ buttonState })
      }
      else if (userScore > 21) {
        bust();
      }
    }
  }, [userCount]);

  useEffect(() => {
    if (dealerCount === undefined) {
      return;
    }

    if (gameState === GameState.dealerTurn) {
      if (dealerScore >= 17) {
        checkWin();
      }
      else {
        drawCard(Deal.dealer);
      }
    }
  }, [dealerCount]);

  const resetGame = () => {
    console.clear();
    resetState()
  }

  const placeBet = (amount: number) => {
    setUpdate({
      bet: amount,
      balance: Math.round((balance - amount) * 100) / 100,
      gameState: GameState.init
    })
  }

  const drawCard = (dealType: Deal) => {
    if (deck.length > 0) {
      const randomIndex = Math.floor(Math.random() * deck.length);
      const card = deck[randomIndex];
      deck.splice(randomIndex, 1);
      setUpdate({ deck })

      switch (card.suit) {
        case 'spades':
          dealCard(dealType, card.value, '♠');
          break;
        case 'diamonds':
          dealCard(dealType, card.value, '♦');
          break;
        case 'clubs':
          dealCard(dealType, card.value, '♣');
          break;
        case 'hearts':
          dealCard(dealType, card.value, '♥');
          break;
        default:
          break;
      }
    }
    else {
      alert('All cards have been drawn');
    }
  }

  const dealCard = (dealType: Deal, value: string, suit: string) => {
    switch (dealType) {
      case Deal.user:
        userCards.push({ 'value': value, 'suit': suit, 'hidden': false });
        setUpdate({ userCards: userCards })
        updateUserCards()
        break;
      case Deal.dealer:
        dealerCards.push({ 'value': value, 'suit': suit, 'hidden': false });
        setUpdate({ dealerCards: dealerCards })
        updateDealerCards()

        break;
      case Deal.hidden:
        dealerCards.push({ 'value': value, 'suit': suit, 'hidden': true });
        setUpdate({ dealerCards: dealerCards })
        updateDealerCards()
        break;
      default:
        break;
    }
  }

  const revealCard = () => {
    dealerCards.filter((card: any) => {
      if (card.hidden === true) {
        card.hidden = false;
      }
      return card;
    });
    setUpdate({ dealerCards: dealerCards })
    updateDealerCards()
  }

  const calculate = (cards: any[], setScore: any) => {
    let total = 0;
    cards.forEach((card: any) => {
      if (card.hidden === false && card.value !== 'A') {
        switch (card.value) {
          case 'K':
            total += 10;
            break;
          case 'Q':
            total += 10;
            break;
          case 'J':
            total += 10;
            break;
          default:
            total += Number(card.value);
            break;
        }
      }
    });
    const aces = cards.filter((card: any) => {
      return card.value === 'A';
    });
    aces.forEach((card: any) => {
      if (card.hidden === false) {
        if ((total + 11) > 21) {
          total += 1;
        }
        else if ((total + 11) === 21) {
          if (aces.length > 1) {
            total += 1;
          }
          else {
            total += 11;
          }
        }
        else {
          total += 11;
        }
      }
    });
    setScore(total);
  }

  const hit = () => {
    drawCard(Deal.user);
  }

  const stand = () => {
    buttonState.hitDisabled = true;
    buttonState.standDisabled = true;
    buttonState.resetDisabled = false;

    setUpdate({
      buttonState,
      gameState: GameState.dealerTurn
    })

    revealCard();
  }

  const bust = () => {
    buttonState.hitDisabled = true;
    buttonState.standDisabled = true;
    buttonState.resetDisabled = false;

    setUpdate({
      buttonState,
      message: Message.bust,
    })
  }

  const checkWin = () => {
    if (userScore > dealerScore || dealerScore > 21) {

      setUpdate({
        balance: Math.round((balance + (bet * 2)) * 100) / 100,
        message: Message.userWin
      })
    }
    else if (dealerScore > userScore) {
      setUpdate({
        message: Message.dealerWin
      });
    }
    else {
      setUpdate({
        balance: Math.round((balance + (bet * 1)) * 100) / 100,
        message: Message.tie
      });
    }
  }

  return (
      <div className={styles.boardContainer}>
        <Status
            message={message}
            balance={balance}
        >
          <Controls
              balance={balance}
              gameState={gameState}
              buttonState={buttonState}
              betEvent={placeBet}
              hitEvent={hit}
              standEvent={stand}
              resetEvent={resetGame}
          />
        </Status>
        <div className={styles.handContainer}>
          <Hand title={`Dealer's Hand (${dealerScore})`} cards={dealerCards} />
          <Hand title={`Your Hand (${userScore})`} cards={userCards} />
        </div>
      </div>
  );
}
