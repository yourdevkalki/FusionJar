import InvestmentForm from "@/components/features/InvestmentForm";

export default function CreateInvestment() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Investment</h1>
        <p className="mt-4 text-gray-600">
          Set up your recurring micro-investment strategy
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <InvestmentForm />
      </div>
    </div>
  );
}
