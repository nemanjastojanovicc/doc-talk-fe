import React from 'react';
import Routes from 'router/components/Routes';
import routes from './routes';

const SubRouter: React.FC = () => {
  return <Routes routes={routes} />;
};

export default SubRouter;
