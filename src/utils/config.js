const stripe_sky = YOUR_STRIPE_KEY_HERE

const production = 'production'
const dev = 'development'

const mode = production

let app_url, api_url

if (mode === production) {
    // app_url = "https://ridanexpress.vercel.app"
    app_url = "http://localhost:3000"
    // api_url = "https://ridanexpress-api-lqo6.onrender.com"
    api_url = "http://localhost:5000"
} else {
    app_url = 'http://localhost:3000'
    api_url = 'http://localhost:5000'
}

export {
    app_url,
    api_url,
    stripe_sky
}