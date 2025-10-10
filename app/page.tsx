"use client";
import Image from "next/image";

export default function LoginPage() {
	return (
		<div className="flex h-screen items-center justify-center bg-gray-100 bg-cover bg-center">
			<div className="bg-gradient-to-b from-blue-700 to-blue-400 rounded-2xl shadow-lg p-10 w-full max-w-sm text-white">
				{/* logo */}
				<div className="mb-4 flex justify-center">
					<Image
						src="/logo-branca.png"
						alt="Logo Allware 30 anos"
						width={256}
						height={256}
						className="mx-auto object-cointain -mt-2"
						priority
					/>
				</div>

				{/* Título */}
				<h2 className="text-center text-2xl font-semibold mb-6">AWSRegistro</h2>

				{/* Formulário */}
				<form className="space-y-4">
					<div>
						<input
							type="text"
							placeholder="Usuário"
							className="w-full bg-transparent border-b border-white focus:outline-none placeholder-white/80"
						/>
					</div>
					<div>
						<input
							type="password"
							placeholder="Senha"
							className="w-full bg-transparent border-b border-white focus:outline-none placeholder-white/80"
						/>
					</div>

					<div className="flex items-center gap-2 text-sm">
						<input type="checkbox" id="remember" />
						<label htmlFor="remember">Lembrar senha</label>
					</div>

					<button
						type="submit"
						className="w-full bg-white text-blue-500 font-medium rounded-full py-2 mt-4 transition-transform duration-200 ease-in-out transform hover:scale-105"
					>
						Login
					</button>
				</form>
			</div>
		</div>
	);
}
