import React from 'react';
import './Test2.styles.scss';

type Test2Props = Record<string, any>;

const Test2: React.FC<Test2Props> = (props) => {
  return <div className='misko'>hello from Test2!</div>;
};

export default Test2;
