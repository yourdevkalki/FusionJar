"use client";


export function HistoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              Investment History
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button className="flex items-center gap-2 rounded-md bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-white/10">
                  <span className="material-icons text-base text-[var(--text-secondary)]">
                    filter_list
                  </span>
                  Filter by Status
                  <span className="material-icons text-base text-[var(--text-secondary)]">
                    expand_more
                  </span>
                </button>
              </div>
              <div className="relative">
                <button className="flex items-center gap-2 rounded-md bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-white/10">
                  <span className="material-icons text-base text-[var(--text-secondary)]">
                    date_range
                  </span>
                  Filter by Date
                  <span className="material-icons text-base text-[var(--text-secondary)]">
                    expand_more
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-lg bg-[var(--surface)] shadow-md">
                  <table className="min-w-full divide-y divide-[var(--stroke)]">
                    <thead className="bg-black/20">
                      <tr>
                        <th
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6"
                          scope="col"
                        >
                          Timestamp
                        </th>
                        <th
                          className="px-3 py-3.5 text-left text-sm font-semibold"
                          scope="col"
                        >
                          Amount
                        </th>
                        <th
                          className="px-3 py-3.5 text-left text-sm font-semibold"
                          scope="col"
                        >
                          From → To Chain
                        </th>
                        <th
                          className="px-3 py-3.5 text-left text-sm font-semibold"
                          scope="col"
                        >
                          Status
                        </th>
                        <th
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                          scope="col"
                        >
                          <span className="sr-only">TX Link</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--stroke)] bg-[var(--surface)]">
                      <tr>
                        <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm text-[var(--text-secondary)] sm:pl-6">
                          2024-01-15 14:30 UTC
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm font-medium">
                          0.05 ETH
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm text-[var(--text-secondary)]">
                          Ethereum → Polygon
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm">
                          <span className="inline-flex items-center rounded-full bg-[var(--success)]/10 px-2 py-1 text-xs font-medium text-[var(--success)]">
                            <svg
                              className="mr-1.5 h-2 w-2"
                              fill="currentColor"
                              viewBox="0 0 8 8"
                            >
                              <circle cx="4" cy="4" r="3"></circle>
                            </svg>
                            Executed
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <a
                            className="flex items-center justify-end gap-1 text-[var(--primary)] transition-colors hover:text-[var(--primary)]/80"
                            href="#"
                          >
                            View TX{" "}
                            <span className="material-icons text-base">
                              open_in_new
                            </span>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm text-[var(--text-secondary)] sm:pl-6">
                          2024-01-14 09:15 UTC
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm font-medium">
                          0.1 BTC
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm text-[var(--text-secondary)]">
                          Bitcoin → Ethereum
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm">
                          <span className="inline-flex animate-pulse items-center rounded-full bg-[var(--warning)]/10 px-2 py-1 text-xs font-medium text-[var(--warning)]">
                            <svg
                              className="mr-1.5 h-2 w-2"
                              fill="currentColor"
                              viewBox="0 0 8 8"
                            >
                              <circle cx="4" cy="4" r="3"></circle>
                            </svg>
                            Pending
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"></td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm text-[var(--text-secondary)] sm:pl-6">
                          2024-01-13 18:45 UTC
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm font-medium">
                          100 USDT
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm text-[var(--text-secondary)]">
                          Tron → Binance Smart Chain
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm">
                          <span className="inline-flex items-center rounded-full bg-[var(--success)]/10 px-2 py-1 text-xs font-medium text-[var(--success)]">
                            <svg
                              className="mr-1.5 h-2 w-2"
                              fill="currentColor"
                              viewBox="0 0 8 8"
                            >
                              <circle cx="4" cy="4" r="3"></circle>
                            </svg>
                            Executed
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <a
                            className="flex items-center justify-end gap-1 text-[var(--primary)] transition-colors hover:text-[var(--primary)]/80"
                            href="#"
                          >
                            View TX{" "}
                            <span className="material-icons text-base">
                              open_in_new
                            </span>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm text-[var(--text-secondary)] sm:pl-6">
                          2024-01-12 12:00 UTC
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm font-medium">
                          0.02 ETH
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm text-[var(--text-secondary)]">
                          Ethereum → Avalanche
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm">
                          <span className="inline-flex items-center rounded-full bg-[var(--success)]/10 px-2 py-1 text-xs font-medium text-[var(--success)]">
                            <svg
                              className="mr-1.5 h-2 w-2"
                              fill="currentColor"
                              viewBox="0 0 8 8"
                            >
                              <circle cx="4" cy="4" r="3"></circle>
                            </svg>
                            Executed
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <a
                            className="flex items-center justify-end gap-1 text-[var(--primary)] transition-colors hover:text-[var(--primary)]/80"
                            href="#"
                          >
                            View TX{" "}
                            <span className="material-icons text-base">
                              open_in_new
                            </span>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm text-[var(--text-secondary)] sm:pl-6">
                          2024-01-11 07:30 UTC
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm font-medium">
                          50 USDC
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm text-[var(--text-secondary)]">
                          Solana → Polygon
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm">
                          <span className="inline-flex animate-pulse items-center rounded-full bg-[var(--warning)]/10 px-2 py-1 text-xs font-medium text-[var(--warning)]">
                            <svg
                              className="mr-1.5 h-2 w-2"
                              fill="currentColor"
                              viewBox="0 0 8 8"
                            >
                              <circle cx="4" cy="4" r="3"></circle>
                            </svg>
                            Pending
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
