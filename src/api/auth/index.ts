const basicAuthPath = (routePath: TemplateStringsArray) => `auth/${routePath}`;

export const signup = () => basicAuthPath`signup`;
export const login = () => basicAuthPath`login`;
export const refreshToken = () => basicAuthPath`refresh-token`;
export const logout = () => basicAuthPath`logout`;
