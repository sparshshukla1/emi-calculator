import { useState, useCallback } from "react";

interface FormValues {
  loanAmount: string;
  interestRate: string;
  tenure: string;
}

interface FormErrors {
  loanAmount?: string;
  interestRate?: string;
  tenure?: string;
}

interface EMIResult {
  monthlyEMI: number;
  totalInterest: number;
  totalAmount: number;
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

function calculateEMI(
  principal: number,
  annualRate: number,
  tenureYears: number
): EMIResult {
  const r = annualRate / 12 / 100;
  const n = tenureYears * 12;

  let monthlyEMI: number;

  if (r === 0) {
    monthlyEMI = principal / n;
  } else {
    const pow = Math.pow(1 + r, n);
    monthlyEMI = (principal * r * pow) / (pow - 1);
  }

  const totalAmount = monthlyEMI * n;
  const totalInterest = totalAmount - principal;

  return { monthlyEMI, totalInterest, totalAmount };
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  const loan = parseFloat(values.loanAmount);
  if (!values.loanAmount.trim()) {
    errors.loanAmount = "Loan amount is required.";
  } else if (isNaN(loan) || loan <= 0) {
    errors.loanAmount = "Please enter a valid positive loan amount.";
  } else if (loan > 10_00_00_000) {
    errors.loanAmount = "Loan amount cannot exceed ₹100 Crore.";
  }

  const rate = parseFloat(values.interestRate);
  if (!values.interestRate.trim()) {
    errors.interestRate = "Annual interest rate is required.";
  } else if (isNaN(rate) || rate < 0) {
    errors.interestRate = "Please enter a valid interest rate (0 or above).";
  } else if (rate > 100) {
    errors.interestRate = "Interest rate cannot exceed 100%.";
  }

  const tenure = parseFloat(values.tenure);
  if (!values.tenure.trim()) {
    errors.tenure = "Loan tenure is required.";
  } else if (isNaN(tenure) || tenure <= 0 || !Number.isInteger(tenure)) {
    errors.tenure = "Please enter a valid tenure in whole years (e.g. 5).";
  } else if (tenure > 30) {
    errors.tenure = "Tenure cannot exceed 30 years.";
  }

  return errors;
}

export default function EMICalculator() {
  const [values, setValues] = useState<FormValues>({
    loanAmount: "",
    interestRate: "",
    tenure: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [result, setResult] = useState<EMIResult | null>(null);
  const [calculated, setCalculated] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
      if (errors[name as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  const handleCalculate = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors = validate(values);
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setResult(null);
        setCalculated(false);
        return;
      }
      setErrors({});
      const emiResult = calculateEMI(
        parseFloat(values.loanAmount),
        parseFloat(values.interestRate),
        parseFloat(values.tenure)
      );
      setResult(emiResult);
      setCalculated(true);
    },
    [values]
  );

  const handleReset = useCallback(() => {
    setValues({ loanAmount: "", interestRate: "", tenure: "" });
    setErrors({});
    setResult(null);
    setCalculated(false);
  }, []);

  const principalPercent =
    result && values.loanAmount
      ? (parseFloat(values.loanAmount) / result.totalAmount) * 100
      : 0;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #1d4ed8 100%)",
      }}
    >
      {/* Header */}
      <header className="py-8 px-4 text-center text-white">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">EMI Calculator</h1>
        </div>
        <p className="text-blue-100 text-sm max-w-md mx-auto">
          Plan your loan smartly — calculate your monthly EMI, total interest,
          and repayment amount instantly.
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Calculator Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Loan Details</h2>
                <p className="text-sm text-gray-500 mt-0.5">Enter your loan information below</p>
              </div>

              <form onSubmit={handleCalculate} noValidate className="p-6 space-y-5">
                {/* Loan Amount */}
                <div>
                  <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Loan Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-base select-none">
                      ₹
                    </span>
                    <input
                      id="loanAmount"
                      name="loanAmount"
                      type="number"
                      value={values.loanAmount}
                      onChange={handleChange}
                      placeholder="e.g. 500000"
                      min="1"
                      className={`w-full pl-8 pr-4 py-3 rounded-xl border text-gray-900 placeholder-gray-400 text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.loanAmount
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.loanAmount && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                      {errors.loanAmount}
                    </p>
                  )}
                </div>

                {/* Interest Rate */}
                <div>
                  <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Annual Interest Rate
                  </label>
                  <div className="relative">
                    <input
                      id="interestRate"
                      name="interestRate"
                      type="number"
                      value={values.interestRate}
                      onChange={handleChange}
                      placeholder="e.g. 8.5"
                      min="0"
                      max="100"
                      step="0.01"
                      className={`w-full pl-4 pr-10 py-3 rounded-xl border text-gray-900 placeholder-gray-400 text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.interestRate
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-base select-none">
                      %
                    </span>
                  </div>
                  {errors.interestRate && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                      {errors.interestRate}
                    </p>
                  )}
                </div>

                {/* Loan Tenure */}
                <div>
                  <label htmlFor="tenure" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Loan Tenure
                  </label>
                  <div className="relative">
                    <input
                      id="tenure"
                      name="tenure"
                      type="number"
                      value={values.tenure}
                      onChange={handleChange}
                      placeholder="e.g. 10"
                      min="1"
                      max="30"
                      step="1"
                      className={`w-full pl-4 pr-16 py-3 rounded-xl border text-gray-900 placeholder-gray-400 text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.tenure
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm select-none">
                      Years
                    </span>
                  </div>
                  {errors.tenure && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                      {errors.tenure}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-base transition-colors shadow-sm"
                  >
                    Calculate EMI
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-3 px-5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-600 font-semibold text-base transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </form>

              {/* EMI Formula Note */}
              <div className="px-6 pb-6">
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                  <p className="text-xs font-semibold text-blue-700 mb-1">EMI Formula</p>
                  <p className="text-xs text-blue-600 font-mono leading-relaxed">
                    EMI = [P × R × (1+R)^N] / [(1+R)^N – 1]
                  </p>
                  <p className="text-xs text-blue-500 mt-2 leading-relaxed">
                    P = Principal &nbsp;|&nbsp; R = Monthly Rate &nbsp;|&nbsp; N = Instalments
                  </p>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="flex flex-col gap-5">
              {calculated && result ? (
                <>
                  {/* Monthly EMI Hero */}
                  <div
                    className="rounded-2xl shadow-xl overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #1e40af, #2563eb)" }}
                  >
                    <div className="p-6 text-white">
                      <p className="text-blue-200 text-sm font-medium mb-1">Monthly EMI</p>
                      <p className="text-4xl font-bold tracking-tight">
                        {formatINR(result.monthlyEMI)}
                      </p>
                      <p className="text-blue-200 text-xs mt-2">
                        Per month for {values.tenure}{" "}
                        {parseInt(values.tenure) === 1 ? "year" : "years"}
                      </p>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
                    <h3 className="text-base font-semibold text-gray-800">
                      Repayment Breakdown
                    </h3>

                    {/* Visual bar */}
                    <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden flex">
                      <div
                        className="h-full rounded-l-full transition-all duration-700"
                        style={{ width: `${principalPercent}%`, background: "#2563eb" }}
                      />
                      <div
                        className="h-full rounded-r-full transition-all duration-700"
                        style={{ width: `${100 - principalPercent}%`, background: "#fb923c" }}
                      />
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#2563eb" }} />
                        Principal
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#fb923c" }} />
                        Interest
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="1" x2="12" y2="23" />
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-600">Principal Amount</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatINR(parseFloat(values.loanAmount))}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-50">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-600">Total Interest Payable</span>
                        </div>
                        <span className="text-sm font-semibold text-orange-600">
                          {formatINR(result.totalInterest)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="1" y="4" width="22" height="16" rx="2" />
                              <line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            Total Amount Payable
                          </span>
                        </div>
                        <span className="text-sm font-bold text-green-700">
                          {formatINR(result.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Placeholder */
                <div className="bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center p-10 text-center h-full min-h-[320px]">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                      <path d="M7 8h10M7 12h6" />
                    </svg>
                  </div>
                  <p className="text-gray-800 font-semibold text-base mb-1">Ready to Calculate</p>
                  <p className="text-gray-400 text-sm max-w-xs">
                    Fill in your loan details on the left and click{" "}
                    <strong className="text-blue-600">Calculate EMI</strong> to see your results here.
                  </p>
                </div>
              )}

              {/* Digital Heroes Button */}
              <a
                href="https://digitalheroesco.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <button
                  type="button"
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                    color: "#fff",
                  }}
                >
                  Built for Digital Heroes
                </button>
              </a>
            </div>
          </div>

          {/* Creator Info */}
          <div className="mt-6 bg-white/10 backdrop-blur rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                SS
              </div>
              <div>
                <p className="text-sm font-semibold">Sparsh Shukla</p>
                <p className="text-xs text-blue-200">sparsh.shukla7200@gmail.com</p>
              </div>
            </div>
            <p className="text-xs text-blue-200">Built with precision for smart borrowers</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 text-center">
        <p className="text-blue-200 text-sm">
          Free EMI Calculator - Built using ReactJS
        </p>
      </footer>
    </div>
  );
}