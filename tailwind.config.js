/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{ts,scss}'],
    theme: {
        extend: {
            colors: {
                background: 'var(--background-color)',
                paper: 'var(--paper-color)',
                primary: {
                    DEFAULT: 'var(--primary-color)',
                    light: 'var(--primary-color-light)',
                    dark: 'var(--primary-color-dark)',
                    contrast: 'var(--primary-color-contrast)',
                },
                secondary: {
                    DEFAULT: 'var(--secondary-color)',
                    light: 'var(--secondary-color-light)',
                    dark: 'var(--secondary-color-dark)',
                    contrast: 'var(--secondary-color-contrast)',
                },
                text: {
                    DEFAULT: 'var(--text-color)',
                    primary: 'var(--text-color-primary)',
                    secondary: 'var(--text-color-secondary)',
                    disabled: 'var(--text-color-disabled)',
                },
            },
        },
    },
    plugins: [],
    darkMode: ['selector', '[data-theme="dark"]']
};

