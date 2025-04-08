const stripe_sky = 'pk_test_51Nk8Y4F0B89ncn3xWB6ZN3GsbVIVL7Jqfa3jxtIOpPkKHcleHZw4EMPJKd4cRwm34ZARBeYmAWwu3VxyYL1gb6OT00UKNSvfvb'


const production = 'production'
const dev = 'development'

const mode = production

let app_url, api_url

if (mode === production) {
    app_url = "https://ridan-express-client.vercel.app"
    api_url = "https://ridan-express-backend-yucx.onrender.com"
} else {
    app_url = 'https://ridan-express-client.vercel.app'
    api_url = 'https://ridan-express-backend-yucx.onrender.com'
}

export {
    app_url,
    api_url,
    stripe_sky
}