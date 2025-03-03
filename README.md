# Business Expense Tracker

A comprehensive web application for tracking and managing business expenses with OCR receipt scanning capabilities.

## Live Demo

Check out the live demo of the application:
[https://dariusjaye.github.io/expense-tracker/](https://dariusjaye.github.io/expense-tracker/)

## Features

- **User Authentication**: Secure login with Firebase Authentication
- **Expense Management**: Add, edit, and delete expenses with categories and payees
- **Receipt Scanning**: Upload and scan receipts using OCR to automatically extract expense data
- **Payee Management**: Manage vendors and suppliers with default categories
- **Analytics Dashboard**: Visualize expense data with charts and graphs
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **OCR**: Veryfi API for receipt scanning
- **Charts**: Chart.js with React-Chartjs-2

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Firebase account
- Veryfi API credentials (for receipt scanning)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Veryfi
NEXT_PUBLIC_VERYFI_CLIENT_ID=your_veryfi_client_id
NEXT_PUBLIC_VERYFI_USERNAME=your_veryfi_username
NEXT_PUBLIC_VERYFI_API_KEY=your_veryfi_api_key
NEXT_PUBLIC_VERYFI_URL=your_veryfi_url
```

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/business-expense-tracker.git
   cd business-expense-tracker
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── api/              # API routes
│   ├── analytics/        # Analytics page
│   ├── expenses/         # Expenses page
│   ├── payees/           # Payees page
│   ├── settings/         # Settings page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Dashboard page
├── components/           # React components
│   ├── ExpenseAnalytics.tsx
│   ├── ExpenseForm.tsx
│   ├── ExpenseList.tsx
│   ├── Navigation.tsx
│   ├── PayeeManager.tsx
│   └── ReceiptUploader.tsx
└── lib/                  # Utility functions and hooks
    ├── contexts/         # React contexts
    │   └── AuthContext.tsx
    ├── firebase/         # Firebase utilities
    │   ├── expenseDb.ts
    │   ├── firebase.ts
    │   └── firebaseUtils.ts
    ├── hooks/            # Custom React hooks
    │   └── useAuth.ts
    └── utils/            # Utility functions
        └── expenseUtils.ts
```

## Usage

1. **Sign In**: Use Google authentication to sign in
2. **Add Expenses**: Manually add expenses or scan receipts
3. **Manage Payees**: Add and edit payees with default categories
4. **View Analytics**: See expense breakdowns by category, payee, and time period
5. **Update Settings**: Manage your profile settings

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Veryfi](https://www.veryfi.com/)
- [Chart.js](https://www.chartjs.org/)

## Deployment

### GitHub Pages

This project is configured for deployment to GitHub Pages. The deployment is automated using GitHub Actions.

For more information about the GitHub Pages deployment, see [GITHUB_PAGES.md](GITHUB_PAGES.md).

### Firebase Hosting

This project can also be deployed to Firebase Hosting. For instructions, see [FIREBASE_HOSTING.md](FIREBASE_HOSTING.md).