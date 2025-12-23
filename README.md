# 🔐 Auth Feature Branch

This branch adds authentication functionality to the project, including user registration, login, verify account, forgot password, profile, update profile and token storage.

> ⚠️ Note: This feature branch is not meant to be merged into main immediately. Merge only when authentication is needed in your project (locally).

## 📌 Features

- Register Page: New users can sign up with required credentials.

- Login Page: Existing users can log in using their credentials.

- Token Handling:

  - Stores accessToken and refreshToken in localStorage.

  - Handles token refreshing logic.

- Account Info: Stores authenticated user's basic account data.

## 🚀 Getting Started

1. Checkout this branch:

```
git checkout auth-feature
```

2. Install dependencies:

```
yarn add
```

3. Run the app:

```
yarn start
```

## 🛠 How It Works

- On successful registration/login:

  - Tokens are stored in localStorage.

  - Account data is saved in the store for use across the app.

- Pages are protected based on auth state.

## 🧪 Testing

You can test the flow by:

1. Registering a new user on /register

2. Logging in with that user on /login

3. Checking that credentials are stored and user is redirected to the protected area

## 📁 Folder Structure

```
- in progress
/src
  ├── pages/
  │   ├── ...
  │   └── ...
  ├── store/
  │   └── ...
  ├── utils/
  │   └── ...
```

## 🔄 Future Improvements

- Support for OAuth (Google, GitHub)
