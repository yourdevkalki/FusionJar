"use client";


export function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white sm:text-6xl mb-4">
            Automate DeFi micro-investments.
          </h1>
          <h2 className="text-3xl font-bold text-purple-light sm:text-5xl mb-6">
            Gasless. Gamified.
          </h2>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto mb-8">
            Tiny investments, huge potential. Start your DeFi journey with as
            little as $1, powered by 1inch Fusion+ for zero gas fees.
          </p>
          <button className="bg-purple text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-dark transition-colors">
            Start Investing
          </button>
        </div>

        {/* Data Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {/* XP Progress */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-white text-sm mb-2">XP Progress</h3>
            <p className="text-white text-2xl font-bold mb-3">Level 2</p>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>1500 XP</span>
              <span>2500 XP</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-yellow h-2 rounded-full"
                style={{ width: "60%" }}
              ></div>
            </div>
          </div>

          {/* Streak */}
          <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center">
            <div className="text-3xl mb-2">🔥</div>
            <p className="text-orange text-2xl font-bold">Day 3</p>
            <p className="text-white text-sm">Streak</p>
          </div>

          {/* Total Invested */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-white text-sm mb-2">Total Invested</h3>
            <p className="text-green text-2xl font-bold">$1,234.56</p>
          </div>

          {/* Chains Used */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-white text-sm mb-2">Chains Used</h3>
            <p className="text-white text-2xl font-bold">5</p>
          </div>

          {/* XP Earned */}
          <div className="bg-gray-800 rounded-lg p-6 col-span-2 md:col-span-1">
            <h3 className="text-white text-sm mb-2">XP Earned</h3>
            <p className="text-yellow text-2xl font-bold">5,678</p>
          </div>
        </div>

        {/* Recent Investment History */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Recent Investment History
          </h2>

          <div className="space-y-4">
            {/* Investment Entry 1 */}
            <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">$10 to Uniswap V3</p>
                  <p className="text-gray-500 text-sm">on Polygon</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green font-medium">+$0.12</p>
                <p className="text-gray-500 text-sm">2 hours ago</p>
              </div>
            </div>

            {/* Investment Entry 2 */}
            <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">$5 to Aave</p>
                  <p className="text-gray-500 text-sm">on Ethereum</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-red font-medium">-$0.05</p>
                <p className="text-gray-500 text-sm">1 day ago</p>
              </div>
            </div>

            {/* Investment Entry 3 */}
            <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">$8 to Curve Finance</p>
                  <p className="text-gray-500 text-sm">on Arbitrum</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green font-medium">+$0.08</p>
                <p className="text-gray-500 text-sm">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
