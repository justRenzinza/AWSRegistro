"use client";

import { useMemo, useState } from "react";

/* ------------ base de clientes (para o select) ----------- */
type Cliente = { id: number; nome: string };

const clientes: Cliente[] = [
	{ id: 1, nome: "CACAU SUL COMERCIO ATACADISTA EIRELI" },
	{ id: 2, nome: "WKS EXPORTACOES LTDA" },
	{ id: 3, nome: "ALLWARE TESTE" },
	{ id: 4, nome: "ALLWARE TESTE (2)" },
	{ id: 5, nome: "ROBSON PASSOS BARBOSA (TESTE GIUCAFE LOCAL)" },
	{ id: 6, nome: "AGRO NORTE ARMAZENS GERAIS LTDA" },
	{ id: 7, nome: "B.M. ARMAZENS GERAIS LTDA" },
];

/* ------------ opções de sistemas para o select ----------- */
const sistemas = [
	"SACEX",
	"ERP Allware",
	"Portal Cliente",
	"Financeiro",
	"Mobile App",
] as const;

type StatusContrato =
	| "Regular"
	| "Irregular (Sem Restrição)"
	| "Irregular (Contrato Cancelado)"
	| "Irregular (Com Restrição)";

type ControleSistema = {
	id: number;
	clienteId: number;
	sistema: string;
	qtdLicenca: number;
	qtdDiaLiberacao: number;
	status: StatusContrato;
};

/* ------------ seed: exemplo p/ TODOS os clientes ---------- */
const seed: ControleSistema[] = clientes.map((c, idx) => {
	const statusPool: StatusContrato[] = [
		"Regular",
		"Irregular (Sem Restrição)",
		"Irregular (Contrato Cancelado)",
		"Irregular (Com Restrição)",
	];
	return {
		id: 100 + idx,
		clienteId: c.id,
		sistema: sistemas[idx % sistemas.length],
		qtdLicenca: [5, 3, 12, 8, 2, 10, 6][idx % 7],
		qtdDiaLiberacao: [31, 15, 7, 10, 20, 5, 30][idx % 7],
		status: statusPool[idx % statusPool.length],
	};
});

/* ---------------------- helpers -------------------------- */
function nomeCliente(id: number) {
	return clientes.find(c => c.id === id)?.nome ?? "—";
}

/* --------------------- componente ------------------------ */
export default function ControleDeSistemaPage() {
	// tabela e filtros
	const [query, setQuery] = useState("");
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [rows, setRows] = useState<ControleSistema[]>(seed);

	// ordenação
	type SortKey = keyof Pick<ControleSistema, "sistema" | "qtdLicenca" | "qtdDiaLiberacao" | "status"> | "cliente";
	type SortDir = "asc" | "desc" | null;
	const [sortKey, setSortKey] = useState<SortKey | null>(null);
	const [sortDir, setSortDir] = useState<SortDir>(null);

	// popup
	const [editingId, setEditingId] = useState<number | null>(null); // 0 = novo
	const [form, setForm] = useState<Partial<ControleSistema>>({});

	// sidebar mobile
	const [openSidebar, setOpenSidebar] = useState(false);

	function toggleSort(key: SortKey) {
		if (sortKey !== key) {
			setSortKey(key);
			setSortDir("asc");
			return;
		}
		if (sortDir === "asc") setSortDir("desc");
		else if (sortDir === "desc") { setSortKey(null); setSortDir(null); }
		else setSortDir("asc");
	}

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		let data = rows.filter(r =>
			[
				nomeCliente(r.clienteId),
				r.sistema,
				String(r.qtdLicenca),
				String(r.qtdDiaLiberacao),
				r.status,
			].join(" ").toLowerCase().includes(q)
		);

		if (sortKey && sortDir) {
			data = [...data].sort((a, b) => {
				let va = "";
				let vb = "";
				if (sortKey === "cliente") {
					va = nomeCliente(a.clienteId).toLowerCase();
					vb = nomeCliente(b.clienteId).toLowerCase();
				} else {
					va = String(a[sortKey] ?? "").toLowerCase();
					vb = String(b[sortKey] ?? "").toLowerCase();
				}
				if (va < vb) return sortDir === "asc" ? -1 : 1; 
				if (va > vb) return sortDir === "asc" ? 1 : -1;
				return 0;
			});
		}
		return data;
	}, [rows, query, sortKey, sortDir]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

	/* ------------------- ações ------------------- */
	function handleAdd() {
		setEditingId(0);
		setForm({
			clienteId: clientes[0]?.id,
			sistema: sistemas[0],
			qtdLicenca: 0,
			qtdDiaLiberacao: 0,
			status: "Regular",
		});
	}

	function handleEdit(id: number) {
		const r = rows.find(x => x.id === id);
		if (!r) return;
		setEditingId(id);
		setForm({ ...r });
	}

	function handleDelete(id: number) {
		const alvo = rows.find(r => r.id === id);
		if (!window.confirm(`Tem certeza que deseja excluir o registro de "${nomeCliente(alvo?.clienteId ?? 0)}"?`)) return;
		setRows(prev => prev.filter(r => r.id !== id));
	}

	function handleCancel() {
		setEditingId(null);
		setForm({});
	}

	function handleSave() {
		// validação simples
		if (!form.clienteId || (form.sistema ?? "").trim() === "") {
			alert("Cliente e Sistema são obrigatórios.");
			return;
		}
		if ((form.qtdLicenca ?? 0) < 0 || (form.qtdDiaLiberacao ?? 0) < 0) {
			alert("Quantidade de licença e dias de liberação não podem ser negativos.");
			return;
		}

		if (editingId === 0) {
			const novo: ControleSistema = {
				id: Date.now(),
				clienteId: form.clienteId!,
				sistema: form.sistema!.trim(),
				qtdLicenca: Number(form.qtdLicenca ?? 0),
				qtdDiaLiberacao: Number(form.qtdDiaLiberacao ?? 0),
				status: (form.status ?? "Regular") as StatusContrato,
			};
			setRows(prev => [novo, ...prev]);
		} else {
			setRows(prev => prev.map(r => r.id === editingId
				? {
					...r,
					clienteId: form.clienteId!,
					sistema: form.sistema!.trim(),
					qtdLicenca: Number(form.qtdLicenca ?? 0),
					qtdDiaLiberacao: Number(form.qtdDiaLiberacao ?? 0),
					status: (form.status ?? "Regular") as StatusContrato,
				}
				: r
			));
		}
		setEditingId(null);
		setForm({});
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="flex">
				{/* ============ SIDEBAR (DESKTOP) — AJUSTADA ========= */}
				<aside className="hidden sm:flex sm:flex-col sm:w-64 sm:min-h-screen sm:sticky sm:top-0 sm:bg-white sm:shadow sm:border-r">
					<div className="bg-gradient-to-r from-blue-700 to-blue-500 p-4 text-white">
						<div className="font-semibold flex-1 text-center">AWSRegistro • Painel</div>
					</div>

					<nav className="flex-1 p-3">
						<a
							href="/clientes"
							className="mb-1 block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
						>
							Cliente
						</a>
						<a
							href="/controle-sistema"
							className="mb-1 flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-900 bg-blue-50 border border-blue-200"
						>
							<span>Controle de Sistema</span>
							<span className="text-xs text-blue-600" />
						</a>
						<a
							href="#"
							className="mb-1 block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
						>
							Controle Registro
						</a>
					</nav>

					<div className="p-3 text-sm text-gray-600">
						<div className="rounded-lg border p-3">
							<div className="mb-1 font-medium text-gray-800">Usuário</div>
							<div className="flex items-center justify-between">
								<span className="text-gray-700">AWS</span>
								<span className="text-gray-400">▾</span>
							</div>
						</div>
					</div>
				</aside>

				{/* drawer mobile (mesmo estilo do resto) */}
				{openSidebar && (
					<div className="fixed inset-0 z-40 sm:hidden" aria-hidden="true" onClick={() => setOpenSidebar(false)}>
						<div className="absolute inset-0 bg-black/40" />
						<div className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
							<div className="bg-gradient-to-r from-blue-700 to-blue-500 p-4 text-white">
								<div className="font-semibold">AWS • Painel</div>
							</div>
							<nav className="p-3">
								<a href="/clientes" className="mb-1 block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">Cliente</a>
								<a href="/controle-sistema" className="mb-1 flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-900 bg-blue-50 border border-blue-200">
									<span>Controle de Sistema</span>
								</a>
								<a href="#" className="mb-1 block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">Controle Registro</a>
							</nav>
						</div>
					</div>
				)}

				{/* área principal */}
				<div className="flex-1">
					{/* topo mobile: botão menu */}
					<div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-white px-4 py-3 sm:hidden">
						<button
							className="rounded-md border px-3 py-2 text-sm shadow transition-transform hover:scale-105"
							onClick={() => setOpenSidebar(true)}
							aria-label="Abrir menu"
						>
							☰
						</button>
						<div className="ml-1 font-medium">Controle de Sistema</div>
					</div>

					<main className="mx-auto max-w-7xl p-4 md:p-6">
						<h1 className="mb-6 text-3xl font-semibold text-gray-800">Controle de Sistema</h1>

						{/* Ações e busca */}
						<div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
							<div className="flex flex-wrap items-center gap-2 text-black">
								<button onClick={handleAdd} className="rounded-md bg-white px-3 py-2 text-sm shadow transition-transform hover:scale-105">➕ Adicionar</button>
								<button className="rounded-md bg-white px-3 py-2 text-sm shadow transition-transform hover:scale-105">⬇️ Exportar</button>
								<button className="rounded-md bg-white px-3 py-2 text-sm shadow transition-transform hover:scale-105">🖨️ Imprimir</button>
							</div>

							<div className="flex items-center gap-2">
								<input
									type="text"
									placeholder="Pesquisa rápida"
									value={query}
									onChange={(e) => { setQuery(e.target.value); setPage(1); }}
									className="w-64 rounded-md border text-black border-gray-300 bg-white px-3 py-2 text-sm"
								/>
								<button className="rounded-md bg-white px-3 py-2 text-sm shadow">🔍</button>
								<button className="rounded-md bg-white px-3 py-2 text-sm shadow">⚙️</button>
							</div>
						</div>

						{/* Tabela com cabeçalho em gradiente (igual Clientes) */}
						<div className="overflow-hidden rounded-xl bg-white shadow">
							<table className="min-w-full border-separate border-spacing-0 text-center">
								<thead>
									<tr className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm">
										<th className="sticky top-0 z-[1] w-24 px-3 py-3">Ações</th>
										<th className="sticky top-0 z-[1] cursor-pointer px-3 py-3 text-left" onClick={() => toggleSort("cliente")}>Cliente {sortKey === "cliente" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
										<th className="sticky top-0 z-[1] cursor-pointer px-3 py-3 text-left" onClick={() => toggleSort("sistema")}>Sistema {sortKey === "sistema" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
										<th className="sticky top-0 z-[1] cursor-pointer px-3 py-3" onClick={() => toggleSort("qtdLicenca")}>Qtd. Licença {sortKey === "qtdLicenca" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
										<th className="sticky top-0 z-[1] cursor-pointer px-3 py-3" onClick={() => toggleSort("qtdDiaLiberacao")}>Qtd. Dias Liberação {sortKey === "qtdDiaLiberacao" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
										<th className="sticky top-0 z-[1] cursor-pointer px-3 py-3" onClick={() => toggleSort("status")}>Status {sortKey === "status" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
									</tr>
								</thead>
								<tbody className="text-sm text-gray-900">
									{pageData.map((r, idx) => (
										<tr key={r.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-200"}>
											<td className="px-3 py-3">
												<div className="flex items-center justify-center gap-2">
													<button onClick={() => handleEdit(r.id)} className="rounded-md border text-white bg-yellow-400 px-2 py-1 hover:bg-yellow-500 transition" title="Editar">✎</button>
													<button onClick={() => handleDelete(r.id)} className="rounded-md border bg-red-500 text-white px-2 py-1 hover:bg-red-600 transition" title="Excluir">✖</button>
												</div>
											</td>
											<td className="px-3 py-3 text-left">{nomeCliente(r.clienteId)}</td>
											<td className="px-3 py-3 text-left">{r.sistema}</td>
											<td className="px-3 py-3">{r.qtdLicenca}</td>
											<td className="px-3 py-3">{r.qtdDiaLiberacao}</td>
											<td className="px-3 py-3">{r.status}</td>
										</tr>
									))}

									{pageData.length === 0 && (
										<tr>
											<td className="px-3 py-8 text-center text-gray-500" colSpan={6}>Nenhum registro encontrado.</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>

						{/* Paginação */}
						<div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-black">
							<div className="text-sm text-gray-700">{filtered.length} registro(s) • Página {page} de {totalPages}</div>
							<div className="flex items-center gap-2">
								<button className="rounded-md border bg-blue-600 text-white px-3 py-2 text-sm shadow-sm hover:bg-blue-800 transition hover:scale-105" onClick={() => setPage(1)} disabled={page === 1}>‹‹</button>
								<button className="rounded-md border bg-blue-600 text-white px-3 py-2 text-sm shadow-sm hover:bg-blue-800 transition hover:scale-105" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
								<button className="rounded-md border bg-blue-600 text-white px-3 py-2 text-sm shadow-sm hover:bg-blue-800 transition hover:scale-105" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
								<button className="rounded-md border bg-blue-600 text-white px-3 py-2 text-sm shadow-sm hover:bg-blue-800 transition hover:scale-105" onClick={() => setPage(totalPages)} disabled={page === totalPages}>››</button>
							</div>
						</div>
					</main>
				</div>
			</div>

			{/* -------------------- POPUP -------------------- */}
			{editingId !== null && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg">
						<h2 className="mb-4 text-xl font-semibold text-blue-700">
							{editingId === 0 ? "Adicionar Registro" : "Editar Registro"}
						</h2>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<label className="text-sm md:col-span-2">
								<span className="mb-1 block text-black">Cliente *</span>
								<select
									value={form.clienteId ?? clientes[0]?.id}
									onChange={(e) => setForm(prev => ({ ...prev, clienteId: Number(e.target.value) }))}
									className="w-full rounded border border-gray-300 text-black px-3 py-2 text-sm"
								>
									{clientes.map(c => (
										<option key={c.id} value={c.id}>{c.nome}</option>
									))}
								</select>
							</label>

							<label className="text-sm md:col-span-2">
								<span className="mb-1 block text-black">Sistema *</span>
								<select
									value={form.sistema ?? sistemas[0]}
									onChange={(e) => setForm(prev => ({ ...prev, sistema: e.target.value }))}
									className="w-full rounded border border-gray-300 text-black px-3 py-2 text-sm"
								>
									{sistemas.map(s => (
										<option key={s} value={s}>{s}</option>
									))}
								</select>
							</label>

							<label className="text-sm">
								<span className="mb-1 block text-black">Qtd. Licença *</span>
								<input
									type="number"
									value={String(form.qtdLicenca ?? 0)}
									onChange={(e) => setForm(prev => ({ ...prev, qtdLicenca: Number(e.target.value) }))}
									className="w-full rounded border border-gray-300 text-black px-3 py-2 text-sm"
									min={0}
								/>
							</label>

							<label className="text-sm">
								<span className="mb-1 block text-black">Qtd. Dia Liberação *</span>
								<input
									type="number"
									value={String(form.qtdDiaLiberacao ?? 0)}
									onChange={(e) => setForm(prev => ({ ...prev, qtdDiaLiberacao: Number(e.target.value) }))}
									className="w-full rounded border border-gray-300 text-black px-3 py-2 text-sm"
									min={0}
								/>
							</label>

							<label className="text-sm md:col-span-2">
								<span className="mb-2 block text-black">Status *</span>
								<div className="space-y-2 text-black">
									{(["Regular","Irregular (Sem Restrição)","Irregular (Contrato Cancelado)","Irregular (Com Restrição)"] as StatusContrato[]).map(st => (
										<label key={st} className="flex items-center gap-2">
											<input
												type="radio"
												name="status"
												checked={(form.status ?? "Regular") === st}
												onChange={() => setForm(prev => ({ ...prev, status: st }))}
											/>
											<span>{st}</span>
										</label>
									))}
								</div>
							</label>
						</div>

						<div className="mt-6 flex justify-end gap-2">
							<button onClick={handleSave} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition">Gravar</button>
							<button onClick={handleCancel} className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 transition">Cancelar</button>
						</div>
					</div>
				</div>
			)}
			{/* ------------------------------------------------ */}
		</div>
	);
}
