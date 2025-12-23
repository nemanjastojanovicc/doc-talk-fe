import React from 'react';
import { Link } from 'react-router-dom';
import './Sub.styles.scss';

type SubProps = Record<string, any>;

const Sub: React.FC<SubProps> = (props) => {
  return (
    <div>
      hello from Sub!
      <div>
        <nav>
          <ul>
            <li>
              <Link to="test1">go to test 1</Link>
            </li>
            <li>
              <Link to="test2">go to test 2(needs authorization)</Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sub;
