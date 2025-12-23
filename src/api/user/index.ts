const basicUserPath = (routePath = '') => `user${routePath && '/'}${routePath}`;

export const basicPath = () => basicUserPath();
