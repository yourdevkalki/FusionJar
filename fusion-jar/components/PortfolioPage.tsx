"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SUPPORTED_CHAINS } from "@/lib/tokens";

interface PortfolioData {
  totalValue: number;
  totalValueUsd: number;
  dayChange: number;
  dayChangePercent: number;
  tokens: Array<{
    address: string;
    symbol: string;
    name: string;
    balance: string;
    balanceUsd: number;
    price: number;
    chainId: number;
  }>;
  chartData: Array<{
    timestamp: number;
    value: number;
  }>;
}

export function PortfolioPage() {
  const { address } = useAuth();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolioData = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedChain) {
        queryParams.append("chainId", selectedChain.toString());
      }
      
      const response = await fetch(`/api/portfolio/${address}?${queryParams}`);
      const result = await response.json();
      
      if (result.success) {
        setPortfolioData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchPortfolioData();
    }
  }, [address, selectedChain]);

  useEffect(() => {
    if (chartRef.current && portfolioData?.chartData) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        // Import Chart.js dynamically
        import("chart.js/auto").then(({ Chart }) => {
          // Destroy existing chart if it exists
          if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
          }

          // Create new chart and store reference
          chartInstanceRef.current = new Chart(ctx, {
            type: "line",
            data: {
              labels: portfolioData.chartData.map(point => 
                new Date(point.timestamp).toLocaleDateString("en-US", { 
                  month: "short", 
                  day: "numeric" 
                })
              ),
              datasets: [
                {
                  label: "Portfolio Value",
                  data: portfolioData.chartData.map(point => point.value),
                  borderColor: "#8b5cf6",
                  backgroundColor: "rgba(139, 92, 246, 0.1)",
                  borderWidth: 3,
                  pointBackgroundColor: "#8b5cf6",
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  tension: 0.4,
                  fill: true,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: "rgba(22, 22, 26, 0.8)",
                  titleColor: "#ffffff",
                  bodyColor: "#8a8a94",
                  borderColor: "#2e2e48",
                  borderWidth: 1,
                  padding: 10,
                  callbacks: {
                    label: function (context: any) {
                      return `Value: $${context.parsed.y.toFixed(2)}`;
                    },
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: false,
                  grid: {
                    color: "#2e2e48",
                    drawBorder: false,
                  },
                  ticks: {
                    color: "#8a8a94",
                    font: {
                      family: "'Inter', sans-serif",
                    },
                    callback: function (value: any) {
                      return "$" + value;
                    },
                  },
                },
                x: {
                  grid: {
                    display: false,
                    drawBorder: false,
                  },
                  ticks: {
                    color: "#8a8a94",
                    font: {
                      family: "'Inter', sans-serif",
                    },
                  },
                },
              },
            },
          });
        });
      }
    }

    // Cleanup function to destroy chart when component unmounts
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [portfolioData?.chartData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const getChainName = (chainId: number) => {
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
    return chain?.name || `Chain ${chainId}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="flex flex-1 justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl">
          <div className="mb-8 flex flex-col gap-6">
            <h1 className="text-4xl font-bold tracking-tighter text-white">
              Portfolio
            </h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2 rounded-2xl bg-gray-800 p-6 shadow-lg">
                <h3 className="mb-2 text-lg font-medium text-gray-500">
                  Total Invested (Lifetime)
                </h3>
                <p className="text-4xl font-bold text-white">$1,250.00</p>
              </div>
              <div className="lg:col-span-2 rounded-2xl bg-gray-800 p-6 shadow-lg">
                <h3 className="mb-2 text-lg font-medium text-gray-500">
                  Value Across Chains
                </h3>
                <p className="text-4xl font-bold text-white">$1,385.50</p>
              </div>
            </div>

            {/* Portfolio Growth Chart */}
            <div className="rounded-2xl bg-gray-800 p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white">
                    Portfolio Growth
                  </h3>
                  <p className="text-gray-500">Past {portfolioData?.chartData?.length || 0} data points</p>
                </div>
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                  <span className="text-sm font-medium text-gray-500">
                    Current Value:{" "}
                    <span className="text-green font-bold">
                      {formatCurrency(portfolioData?.totalValueUsd || 0)}
                    </span>
                  </span>
                  <div className="flex gap-1 rounded-lg bg-gray-700 p-1">
                    <button className="px-3 py-1 text-sm font-medium rounded-md bg-purple text-white">
                      1Y
                    </button>
                    <button className="px-3 py-1 text-sm font-medium rounded-md text-gray-500 hover:bg-background">
                      6M
                    </button>
                    <button className="px-3 py-1 text-sm font-medium rounded-md text-gray-500 hover:bg-background">
                      1M
                    </button>
                    <button className="px-3 py-1 text-sm font-medium rounded-md text-gray-500 hover:bg-background">
                      7D
                    </button>
                  </div>
                </div>
              </div>
              <div className="h-80">
                <canvas ref={chartRef}></canvas>
              </div>
            </div>
          </div>

          {/* Token Holdings Table */}
          <div className="flex flex-col gap-4">
            <h2 className="px-2 text-2xl font-bold tracking-tight text-white">
              Token Holdings
            </h2>
            <div className="overflow-x-auto rounded-2xl bg-gray-800 shadow-lg">
              <table className="w-full text-left">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-sm font-medium text-gray-500">
                      Token
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Balance
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Value (USD)
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Chain
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData?.tokens?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-400">
                        No tokens found in your portfolio
                      </td>
                    </tr>
                  ) : (
                    portfolioData?.tokens?.map((token, index) => (
                      <tr key={`${token.address}-${token.chainId}`} className="border-b border-gray-700 transition-colors hover:bg-background">
                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs font-mono text-white">
                              {token.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                {token.symbol}
                              </div>
                              <div className="text-xs text-gray-400">
                                {token.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle text-white">
                          {parseFloat(token.balance).toFixed(4)} {token.symbol}
                        </td>
                        <td className="px-6 py-4 align-middle text-white">
                          {formatCurrency(token.balanceUsd)}
                        </td>
                        <td className="px-6 py-4 align-middle text-white">
                          {formatCurrency(token.price)}
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-400">
                            {getChainName(token.chainId)}
                          </span>
                        </td>
                      </tr>
                    )) || []
                  )}
                  <tr className="border-b border-gray-700 transition-colors hover:bg-background">
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <img
                            alt="MATIC logo"
                            className="h-8 w-8 rounded-full border-2 border-solid border-gray-800"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQqftcHo1Uo5eiwY8XU3fb13ACE3GTnfUONOp9GA-RmI28WTilMnyoQ0BcanMfnkni_wxP6bZxFuwKaJbrMsOr1QQ0pg2xDX2Qoj3QD7hFLuoZN6IAb5y6FP6ZCQ8qvkkx0HwwB84JusBzc6gZSsmzZDY3x5x4GXgeKvDZQCiOOatjKwXHGTEyRdQEdW7EvXekCfkIv2w4TIIYx3UsXWaX4FFXUNJGcwZTUq94AKBh4K50C8xFOCGHOKM-Jl5aT6niNjBFZNadZw"
                          />
                          <img
                            alt="Chain logo"
                            className="h-8 w-8 -ml-3 rounded-full border-2 border-solid border-gray-800"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGfs6CzSe6nTBoIlaEQBSxwQ0aVNtTZb5CVryVNpRoxjTUu9UhnIHo2mRz9TlGQQdYvBNcT3fjrjfo9r3iXRQGAP5xh3l3f2XXcLBJZZRYhk5OnRbrrcxa9kFSsYrf8_mK4nsn6N7qEZwQ2dNjeuAoT0gDKIGmoyTv8iqhauaADbEdIY-40fN-niR8l_xc1ky4-DJ7DUcWb-e_vcXlmkWWZzB4SmBPO19Jm8JXUMBSskRGsfxiO0IkQvq8lxTZeBS15q4C85pVmA"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            MATIC/Polygon
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle text-white">
                      $400.00
                    </td>
                    <td className="px-6 py-4 align-middle text-white">
                      $458.00
                    </td>
                    <td className="px-6 py-4 align-middle text-green">
                      +14.5%
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <button className="flex items-center gap-2 rounded-full bg-gray-500/20 px-3 py-1 text-sm font-medium text-gray-500">
                        <span className="text-lg">▶️</span>
                        <span>Paused</span>
                      </button>
                    </td>
                  </tr>

                  {/* AVAX Row */}
                  <tr className="transition-colors hover:bg-background">
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <img
                            alt="AVAX logo"
                            className="h-8 w-8 rounded-full border-2 border-solid border-gray-800"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfLSul3dPGg-qFTIbMUDKYyNFvJFavN-FpnskP7pUJ9cS9l3QDdqI_gyUeh3-ufLBLUpUl6s2amphu_fc2xt1-N3EXppldZ7bknc4HfwXc5Hr4_3-CofjPNfMinBHavMNVoxp2gxJxtFKITtOXtR_P1vHc_pTdHLlT7sjwJDl2xygWbMNfDk6obyNMmzlUceTI4TnOgHz9CkPvY6_IdCr6HfZ4yJunvwR4LK3CP-nRpSx633SPMRR3pQcTTgFM6Xaioj0KVuxRYA"
                          />
                          <img
                            alt="Chain logo"
                            className="h-8 w-8 -ml-3 rounded-full border-2 border-solid border-gray-800"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjERa3fs3j1_beC--AVsE7xvMaK6SMCiXN4pxiBJbnT7I9FKlTMNDAv3fr3VBtff18ZQhXLDgndwHNMJn5h2Ms0gN5Jk67PdNimNzjxrhh4hB_ppo7K1k8opyo2oWsY_3S0xQN8K17mfsHreiEVaWwbgkUei5wixYr4AZr7ZZFKl1oF9kIYiKVUc1JaI2q1gNXCTm_9vDZ14LrKj_iJviFvqBvo6BTjNUIrbXVtPbm2X_EKWzfUHj_quXabXPJ7UWSbygVXx9v0w"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            AVAX/Avalanche
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle text-white">
                      $350.00
                    </td>
                    <td className="px-6 py-4 align-middle text-white">
                      $365.00
                    </td>
                    <td className="px-6 py-4 align-middle text-green">
                      +4.28%
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <button className="flex items-center gap-2 rounded-full bg-green/20 px-3 py-1 text-sm font-medium text-green">
                        <span className="text-lg">⏸️</span>
                        <span>Active</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
