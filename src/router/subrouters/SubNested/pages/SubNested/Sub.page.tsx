import React from 'react';
import { Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import './Sub.styles.scss';

type SubProps = Record<string, any>;

const Sub: React.FC<SubProps> = (props) => {
  return (
    <div className="subnested">
      <h1>
        hello from Nested Sub!
      </h1>
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
      <Outlet />
    </div>
  );
};

export default Sub;
