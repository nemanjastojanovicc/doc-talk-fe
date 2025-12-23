import { FC, useState } from 'react';

import './Tabs.styles.scss';
import classNames from 'classnames';

type TabItem = {
  label: string;
  element: React.ReactNode;
};

type TabsProps = {
  className?: string;
  items: TabItem[];
};

const Tabs: FC<TabsProps> = ({ className = '', items }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: '0',
    width: 'auto',
    transition: 'none',
    opacity: 0,
  });

  const updateIndicator = (target: EventTarget & HTMLButtonElement) => {
    const { offsetLeft, offsetWidth } = target;

    setIndicatorStyle({
      left: `${offsetLeft}px`,
      width: `${offsetWidth}px`,
      transition: 'left 300ms ease-in-out, width 300ms ease-in-out',
      opacity: 1,
    });
  };

  const handleTabClick = (
    index: number,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setActiveTab(index);
    updateIndicator(e.currentTarget);
  };

  const handleFirstTabRef = (el: HTMLButtonElement | null) => {
    if (el && indicatorStyle.opacity === 0) {
      const { offsetLeft, offsetWidth } = el;
      setIndicatorStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
        transition: 'none',
        opacity: 1,
      });
    }
  };

  return (
    <div className={classNames('tabs', className)}>
      <div className="tabs__header">
        {items.map((item, index) => (
          <button
            key={item.label}
            ref={index === 0 ? handleFirstTabRef : null}
            className={classNames('tabs__header__item', {
              'tabs__header__item--active': index === activeTab,
            })}
            onClick={(e) => handleTabClick(index, e)}
          >
            {item.label}
          </button>
        ))}
        <div className="tabs__header__indicator" style={indicatorStyle} />
      </div>

      <div className="tabs__content">{items[activeTab].element}</div>
    </div>
  );
};

export default Tabs;
