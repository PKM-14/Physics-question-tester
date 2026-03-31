import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <h1>Adaptive Physics Olympiad Trainer</h1>
          <nav>
            <Link href="/practice">Practice</Link>
            <Link href="/dashboard">Dashboard</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
