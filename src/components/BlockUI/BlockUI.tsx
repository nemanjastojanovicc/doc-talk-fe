import { FC, ReactNode } from 'react';

import { LoadingSpinner } from 'components';

export type BlockUIProps = {
  children?: ReactNode;
  fallback?: ReactNode;
  fallbackCondition?: boolean;
  loading?: boolean;
};

const BlockUI: FC<BlockUIProps> = ({
  children,
  fallback,
  fallbackCondition,
  loading,
}) => {
  if (loading) return <LoadingSpinner />;

  return <>{fallbackCondition ? fallback : children}</>;
};

export default BlockUI;
