export const env = process.env.NODE_ENV;
export const local = process.env.NODE_ENV === 'local';
export const development = process.env.NODE_ENV === 'development';
export const staging = process.env.NODE_ENV === 'staging';
export const production = process.env.NODE_ENV === 'production';

export const isDevelopment = process.env.NODE_ENV !== 'production';
