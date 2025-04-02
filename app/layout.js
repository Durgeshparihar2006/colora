import { TransactionProvider } from '@/app/context/TransactionContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TransactionProvider>
          {children}
        </TransactionProvider>
      </body>
    </html>
  );
} 