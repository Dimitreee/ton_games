import React from 'react';
import styles from './Hand.module.css';
import Card from '../Card/Card';

type HandProps = {
  title: string,
  cards: any[]
};

const Hand: React.FC<HandProps> = (props) => {
  const { title, cards } = props;

  return (
    <div className={styles.handContainer}>
      {cards.length > 0 && (
          <h5 className={styles.title}>{title}</h5>
      )}
      <div className={styles.cardContainer}>
        {cards.map((card: any, index: number) => {
          return (
            <Card key={index} value={card.value} suit={card.suit} hidden={card.hidden} />
          );
        })}
      </div>
    </div>
  );
}

export default Hand;
