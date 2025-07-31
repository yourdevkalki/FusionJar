"use client";

import { useEffect, useRef } from "react";

export function PortfolioPage() {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        // Import Chart.js dynamically
        import("chart.js/auto").then(({ Chart }) => {
          new Chart(ctx, {
            type: "line",
            data: {
              labels: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ],
              datasets: [
                {
                  label: "Portfolio Value",
                  data: [
                    1250, 1260, 1280, 1275, 1300, 1310, 1330, 1320, 1340, 1355,
                    1370, 1385.5,
                  ],
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
  }, []);

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
                  <p className="text-gray-500">Past 12 months</p>
                </div>
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                  <span className="text-sm font-medium text-gray-500">
                    Total Growth:{" "}
                    <span className="text-green font-bold">+10.84%</span>
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

          {/* Jar Breakdown Table */}
          <div className="flex flex-col gap-4">
            <h2 className="px-2 text-2xl font-bold tracking-tight text-white">
              Jar Breakdown
            </h2>
            <div className="overflow-x-auto rounded-2xl bg-gray-800 shadow-lg">
              <table className="w-full text-left">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-sm font-medium text-gray-500">
                      Jar Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Amount Invested
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Current Value
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      ROI %
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* ETH Row */}
                  <tr className="border-b border-gray-700 transition-colors hover:bg-background">
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <img
                            alt="ETH logo"
                            className="h-8 w-8 rounded-full border-2 border-solid border-gray-800"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWQ-il5WeLPfoAdRKHdWiPt34EfFWVyBQ1w3qz1TsXpHCruIBqND4IEMOBDp4u1WxbfV8D4NvzogLZiVwgKPM55Zgx4wSMNLE-V2gr-IXQjfKGYwy7GC1U2nSV_Cr_MrnuD5WDAXheQSGKDEiyrSXtyQg4hnvcDIHRVIH3UJHa-Ly4SYafVAJljpmxwUMlMKyB0L6iliBCDVfmeOZWctfMIZoQfmzVMjJczdQe8ykorvwB7gtdnpTNT-0UDzUtOEnW_YT_9teN5A"
                          />
                          <img
                            alt="Chain logo"
                            className="h-8 w-8 -ml-3 rounded-full border-2 border-solid border-gray-800"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuASQNCbeVPuM6Yk2p9yGyXqAAjif5mDKDjfonGi2K6wsMHe_tYSV-swTcw90goX02_Oy68GkXXG8BMGOlOPn9m38AXYXMIbbdN-f_9IklIlt4L3tCbnUImdSCuV_0U9JGQwyOP1Hko5EwsE8ifV_vVhJBlBsaH4rPlonR67lnYEbYGImapbiZQlcI7m27yai204g1JkPV7mE8ViLiVEkjDbXcLAWmqH54Aw_FhkRVe8MAxqXGfc82NHXRTgS1Qf-gw2a0vN-jFl-Q"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            ETH/Ethereum
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle text-white">
                      $500.00
                    </td>
                    <td className="px-6 py-4 align-middle text-white">
                      $562.50
                    </td>
                    <td className="px-6 py-4 align-middle text-green">
                      +12.5%
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <button className="flex items-center gap-2 rounded-full bg-green/20 px-3 py-1 text-sm font-medium text-green">
                        <span className="text-lg">⏸️</span>
                        <span>Active</span>
                      </button>
                    </td>
                  </tr>

                  {/* MATIC Row */}
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
