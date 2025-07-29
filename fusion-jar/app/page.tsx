import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
          Start Your $5/Week DeFi Journey
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
          Automate your micro-investments across chains with gasless swaps. 
          Build wealth one dollar at a time with gamified savings.
        </p>
        <div className="mt-10">
          <Link
            href="/create"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Investing
          </Link>
        </div>
      </div>
    </div>
  )
}
