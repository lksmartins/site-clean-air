/** @type {import('next').NextConfig} */

require('dotenv').config()

const nextConfig = {
  reactStrictMode: true,
  
}

const env = {
  env: {
    ENV: process.env.ENV,
    NEXT_PUBLIC_RECAPTCHA_KEY: process.env.RECAPTCHA_KEY,
    NEXT_PUBLIC_BACK_URL: process.env.NEXT_PUBLIC_BACK_URL
  }
}

const webpack = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    })

    return config
  }
}

module.exports = [[nextConfig, webpack, env]]