const stripe_sky = import.meta.env.VITE_STRIPE_PUBLIC_KEY || ''

const app_url = import.meta.env.VITE_APP_URL || 'http://localhost:3000'
const api_url = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export {
    app_url,
    api_url,
    stripe_sky
}