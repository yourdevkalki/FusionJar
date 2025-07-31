"use client";

import { useState } from "react";

export default function Invest() {
  const [activeTab, setActiveTab] = useState("select-token");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="container mx-auto px-6 py-12 flex-grow">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-12">
            <div>
              <h2 className="text-4xl font-bold text-[var(--on-surface-strong)]">
                Create Jar
              </h2>
              <p className="text-[var(--on-surface)] mt-2">
                Set up a recurring cross-chain investment intent (Fusion+
                intent).
              </p>
            </div>
            <div className="space-y-8">
              <div>
                <div className="border-b border-[var(--border-color)] mb-6">
                  <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                    <button
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "select-token"
                          ? "tab-active"
                          : "tab-inactive"
                      }`}
                      onClick={() => setActiveTab("select-token")}
                    >
                      Select Token
                    </button>
                    <button
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "search-token"
                          ? "tab-active"
                          : "tab-inactive"
                      }`}
                      onClick={() => setActiveTab("search-token")}
                    >
                      Search by Token Address
                    </button>
                  </nav>
                </div>
                <div
                  className={`space-y-6 ${
                    activeTab === "select-token" ? "" : "hidden"
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                        htmlFor="source-chain"
                      >
                        Source Chain
                      </label>
                      <select
                        className="input-base select-base"
                        id="source-chain"
                      >
                        <option>Ethereum</option>
                        <option>Polygon</option>
                        <option>Arbitrum</option>
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                        htmlFor="destination-chain"
                      >
                        Destination Chain
                      </label>
                      <select
                        className="input-base select-base"
                        id="destination-chain"
                      >
                        <option>Polygon</option>
                        <option>Ethereum</option>
                        <option>Optimism</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                      htmlFor="select-token-input"
                    >
                      Token
                    </label>
                    <select
                      className="input-base select-base"
                      id="select-token-input"
                    >
                      <option>Select Token</option>
                      <option>Bitcoin (BTC)</option>
                      <option>Ethereum (ETH)</option>
                    </select>
                  </div>
                </div>
                <div
                  className={`${
                    activeTab === "search-token" ? "" : "hidden"
                  } space-y-6`}
                >
                  <div>
                    <label
                      className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                      htmlFor="token-address"
                    >
                      Token Address
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-grow">
                        <input
                          className="input-base peer"
                          id="token-address"
                          placeholder="0x..."
                          type="text"
                          defaultValue="0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
                        />
                        <p className="mt-2 text-xs text-[var(--success)] peer-invalid:hidden">
                          Valid Uniswap (UNI) Address
                        </p>
                        <p className="mt-2 text-xs text-red-500 hidden peer-invalid:block">
                          Invalid address format.
                        </p>
                      </div>
                      <button className="btn-primary text-sm px-4 py-2 self-center sm:self-auto">
                        Fetch Token Info
                      </button>
                    </div>
                  </div>
                  <div className="bg-[var(--surface)] p-4 rounded-xl space-y-3">
                    <p className="text-sm font-medium text-[var(--on-surface-strong)]">
                      Token Name:{" "}
                      <span className="font-normal text-[var(--on-surface)]">
                        Uniswap (UNI)
                      </span>
                    </p>
                    <p className="text-sm font-medium text-[var(--on-surface-strong)]">
                      Chain Compatibility:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ethereum
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Polygon
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Arbitrum
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[var(--on-surface-strong)] mb-6">
                  Recurring Investment Plan
                </h3>
                <div className="space-y-6">
                  <div className="relative">
                    <label
                      className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                      htmlFor="amount"
                    >
                      Amount to invest
                    </label>
                    <input
                      className="input-base pr-16"
                      id="amount"
                      placeholder="0.0"
                      type="number"
                    />
                    <div className="absolute inset-y-0 right-0 top-7 flex items-center pr-3 pointer-events-none">
                      <span className="text-[var(--on-surface-strong)] sm:text-sm">
                        UNI
                      </span>
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                      htmlFor="frequency"
                    >
                      Interval
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <select className="input-base select-base" id="frequency">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                        <option>Custom</option>
                      </select>
                      <div className="relative">
                        <input
                          className="input-base pr-20"
                          id="custom-days"
                          placeholder="e.g. 10"
                          type="number"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-[var(--on-surface)] sm:text-sm">
                            days
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                      htmlFor="start-date"
                    >
                      Start Date
                    </label>
                    <input
                      className="input-base"
                      id="start-date"
                      type="date"
                      defaultValue="2024-07-15"
                    />
                  </div>
                  <details className="group" id="advanced-settings">
                    <summary className="flex items-center justify-between cursor-pointer text-[var(--on-surface)] hover:text-white">
                      <span className="font-medium">Advanced Settings</span>
                      <svg
                        className="w-5 h-5 transition-transform duration-300 group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 9l-7 7-7-7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        ></path>
                      </svg>
                    </summary>
                    <div className="mt-4 space-y-6 pt-4 border-t border-[var(--border-color)]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label
                            className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                            htmlFor="gas-limit"
                          >
                            Gas Limit Override
                          </label>
                          <input
                            className="input-base"
                            id="gas-limit"
                            placeholder="Auto"
                            type="text"
                          />
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                            htmlFor="min-slippage"
                          >
                            Min. Slippage (%)
                          </label>
                          <input
                            className="input-base"
                            id="min-slippage"
                            placeholder="0.5"
                            type="number"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label
                            className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                            htmlFor="deadline"
                          >
                            Deadline (minutes)
                          </label>
                          <input
                            className="input-base"
                            id="deadline"
                            placeholder="20"
                            type="number"
                          />
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                            htmlFor="stop-swaps"
                          >
                            Stop after N swaps
                          </label>
                          <input
                            className="input-base"
                            id="stop-swaps"
                            placeholder="Never"
                            type="text"
                          />
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[var(--surface)] p-6 md:p-8 rounded-3xl shadow-2xl shadow-[var(--primary)]/10 space-y-8 sticky top-32 self-start">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-2xl font-bold text-[var(--on-surface-strong)]">
                Preview
              </h3>
              <div className="flex-grow sm:max-w-xs">
                <label
                  className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                  htmlFor="jar-name"
                >
                  Jar Name
                </label>
                <input
                  className="input-base h-12"
                  id="jar-name"
                  placeholder="e.g. My Weekly UNI Jar"
                  type="text"
                />
              </div>
            </div>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <p className="text-[var(--on-surface)]">Token</p>
                <p className="text-[var(--on-surface-strong)] font-medium">
                  Uniswap (UNI)
                </p>
              </div>
              <div className="border-t border-[var(--border-color)]"></div>
              <div className="flex justify-between items-center">
                <p className="text-[var(--on-surface)]">Amount</p>
                <p className="text-[var(--on-surface-strong)] font-medium">
                  0.1 UNI
                </p>
              </div>
              <div className="border-t border-[var(--border-color)]"></div>
              <div className="flex justify-between items-center">
                <p className="text-[var(--on-surface)]">Frequency</p>
                <p className="text-[var(--on-surface-strong)] font-medium">
                  Weekly
                </p>
              </div>
              <div className="border-t border-[var(--border-color)]"></div>
              <div className="flex justify-between items-center">
                <p className="text-[var(--on-surface)]">Start Date</p>
                <p className="text-[var(--on-surface-strong)] font-medium">
                  July 15, 2024
                </p>
              </div>
              <div className="border-t border-[var(--border-color)]"></div>
              <div className="flex justify-between items-center">
                <p className="text-[var(--on-surface)]">From</p>
                <p className="text-[var(--on-surface-strong)] font-medium flex items-center gap-2">
                  <img
                    alt="Ethereum logo"
                    className="w-5 h-5"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAt4BcnslFfJAVPfQZfmTnsjP5cXvlXbfU7GQl5OBRi-XESPjTnolBpJrOy9LJBqqE7fN0dlkq5cA9qtyEdgVKu90gvNNePRD8KEpE_U1RSyRKvR_tSElUIgh-1zrJdxKVk5dlNMmPeVEo_Txnv6JLrJsxMo6mCw9n2TkAuB0j-cBLRhBAKdxRn3lEQnAsPfKqFO-b_5JXrN_3sX5hg5egRj9HbSMem2WZLFwpZwAnkwqfSV_bZh4-5CpixOAojGtPdZCfJlLYfPg"
                  />{" "}
                  Ethereum
                </p>
              </div>
              <div className="border-t border-[var(--border-color)]"></div>
              <div className="flex justify-between items-center">
                <p className="text-[var(--on-surface)]">To</p>
                <p className="text-[var(--on-surface-strong)] font-medium flex items-center gap-2">
                  <img
                    alt="Polygon logo"
                    className="w-5 h-5"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuARGBs-RST44kp2Pbd9RlE61g2fi5I3CKcQZb6l7s_yD8IiGQ5xVrjf3VA4cdaCCJuryo-dM3viPfhaLo7DNvS7tvvHQfiMDuIoZewVZlSc3rB9YkjyqD11reP1k7ou2PQQkc9_-m2yGbs9xYbtnBO9Zt7WlSqqgUFi8C5oaRCgV8d_CVMSNzrDjx7rNC91onJGWMCqsZ-2UXjav58tObsNdYwA3DSBwpNMXOOCAj3-gtLUxkAMfQIbgbo1AXlT0JMshNi6nXrFmQ"
                  />{" "}
                  Polygon
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label
                className="flex items-center gap-3 cursor-pointer"
                htmlFor="save-template"
              >
                <input
                  className="h-4 w-4 rounded bg-[var(--surface)] border-[var(--border-color)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  id="save-template"
                  type="checkbox"
                />
                <span className="text-sm text-[var(--on-surface)]">
                  Save as Template
                </span>
              </label>
            </div>
            <button
              className="w-full btn-primary flex items-center justify-center gap-2"
              id="launch-jar-btn"
              onClick={openModal}
            >
              <span>Launch Jar</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--success)]/20 text-[var(--success)]">
                Gasless
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-[100] ${
          isModalOpen ? "" : "hidden"
        } p-4`}
      >
        <div className="bg-[var(--surface)] rounded-3xl shadow-2xl shadow-[var(--primary)]/20 w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0">
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start">
              <h3 className="text-2xl font-bold text-[var(--on-surface-strong)]">
                Confirm Your Jar
              </h3>
              <button
                className="p-1 rounded-full text-[var(--on-surface)] hover:bg-[var(--background)]"
                onClick={closeModal}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
              </button>
            </div>
            <p className="text-[var(--on-surface)] mt-2">
              Please review and sign to launch your recurring swap.
            </p>
            <div className="mt-8 space-y-5 border-t border-b border-[var(--border-color)] py-6">
              <div className="flex justify-between items-center text-sm">
                <p className="text-[var(--on-surface)]">Jar Name</p>
                <p className="text-[var(--on-surface-strong)] font-medium">
                  My Weekly UNI Jar
                </p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <p className="text-[var(--on-surface)]">Swap</p>
                <p className="text-[var(--on-surface-strong)] font-medium">
                  0.1 ETH → 25.5 UNI
                </p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <p className="text-[var(--on-surface)]">Frequency</p>
                <p className="text-[var(--on-surface-strong)] font-medium">
                  Weekly
                </p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <p className="text-[var(--on-surface)]">Execution Window</p>
                <p className="text-[var(--on-surface-strong)] font-medium">
                  ~ 15 Mins
                </p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <p className="text-[var(--on-surface)]">Est. Gas Fees</p>
                <p className="font-medium flex items-center gap-1 text-[var(--success)]">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                  Gasless
                </p>
              </div>
            </div>
            <div className="mt-8">
              <button className="w-full btn-primary flex items-center justify-center gap-2">
                Sign & Start Recurring Swap
              </button>
              <p className="text-xs text-center mt-4 text-[var(--on-surface)]">
                You'll be asked to sign a transaction in your wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
