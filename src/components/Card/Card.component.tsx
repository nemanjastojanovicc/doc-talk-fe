import React, { ReactNode } from 'react';
import classNames from 'classnames';
import './Card.styles.scss';

export type CardProps = {
  children?: ReactNode;
  className?: string;
  role?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

const Card: React.FC<CardProps> = (props) => {
  const { className, children, onClick, role } = props;
  const classes = classNames(['card', className]);

  return (
    <div className={classes} onClick={onClick} {...(role && { role })}>
      {children}
    </div>
  );
};

export default Card;
