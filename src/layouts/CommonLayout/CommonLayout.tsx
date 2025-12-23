import { Header } from 'layouts/components';
import { Outlet } from 'react-router-dom';
import './CommonLayout.styles.scss';

const CommonLayout = () => {
  return (
    <>
      <Header />
      <main className="cl-main">
        <Outlet />
      </main>
    </>
  );
};

export default CommonLayout;
