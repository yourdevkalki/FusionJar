import PortfolioDashboard from "@/components/features/PortfolioDashboard";

export default function Portfolio() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
        <p className="mt-4 text-gray-600">
          Track your investments and performance
        </p>
      </div>

      <PortfolioDashboard />
    </div>
  );
}
