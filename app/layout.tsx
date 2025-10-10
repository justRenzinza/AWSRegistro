import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
	display: "swap",
});

export const metadata = { title: "AWSRegistro" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-BR" className={inter.variable}>
			<body className="font-sans antialiased bg-gray-50 text-gray-900">
				{children}
			</body>
		</html>
	);
}
