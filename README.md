# Learnoverse Player Project

Hey! This is my submission for the Learnoverse Software Dev Internship
assignment.

It's a small React Native app that plays YouTube videos. The video list
comes from a Node.js backend that pulls data from MongoDB and the
YouTube API.

Built by **Swastik Shetty**.

------------------------------------------------------------------------

## What it does

-   Starts with a cool animated splash screen.
-   Shows a list of 10 videos with their thumbnails and titles.
-   You can tap any video to play it right inside the app.
-   Pull down on the list to refresh the videos.
-   Has a nice dark mode UI with some simple animations.
-   There's also an 'info' button with a bit about me and the project.

------------------------------------------------------------------------

## Tech I used

-   **App:** React Native (TypeScript)\
-   **Server:** Node.js / Express\
-   **Database:** MongoDB\
-   **Animation:** Lottie\
-   **YouTube Stuff:** YouTube Data API & react-native-youtube-iframe

------------------------------------------------------------------------

## How to run it

You'll need **Node.js**, the usual React Native setup (**Android Studio,
etc.**), a **MongoDB Atlas account**, and a **YouTube API Key**.

### 1. Set up the Server

``` bash
# Go into the server folder
cd server

# Install the packages
npm install

# Create a .env file and add your keys
MONGO_URI=your_mongo_string
YOUTUBE_API_KEY=your_youtube_key

# Make sure you've added the 10 videoIds to your database!

# Start the server
node server.js
```

The server will be running on **localhost:3000**.

------------------------------------------------------------------------

### 2. Set up the App

``` bash
# In a new terminal, go into the client folder
cd client

# Install packages
npm install

# If you're on a Mac for iOS development
cd ios && pod install && cd ..

# Run it!
# For Android (make sure an emulator is open)
npx react-native run-android

# For iOS (Mac only)
npx react-native run-ios
```

That's it! The app should launch, and you'll see the videos.
