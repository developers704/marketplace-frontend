export default function Certificate() {
  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-gradient-to-br from-amber-50 to-stone-100 border-4 border-amber-600 relative">
      {/* Corner Decorations */}
      <div className="absolute top-4 left-4">
        <CornerDecoration />
      </div>
      <div className="absolute top-4 right-4 rotate-90">
        <CornerDecoration />
      </div>
      <div className="absolute bottom-4 left-4 -rotate-90">
        <CornerDecoration />
      </div>
      <div className="absolute bottom-4 right-4 rotate-180">
        <CornerDecoration />
      </div>

      {/* Top Border Lines */}
      <div className="absolute top-12 left-20 right-20 h-0.5 bg-amber-600"></div>
      <div className="absolute top-16 left-32 right-32 h-0.5 bg-amber-600"></div>

      {/* Bottom Border Lines */}
      <div className="absolute bottom-16 left-32 right-32 h-0.5 bg-amber-600"></div>
      <div className="absolute bottom-12 left-20 right-20 h-0.5 bg-amber-600"></div>

      {/* Side Border Lines */}
      <div className="absolute left-12 top-20 bottom-20 w-0.5 bg-amber-600"></div>
      <div className="absolute right-12 top-20 bottom-20 w-0.5 bg-amber-600"></div>

      {/* Certificate Content */}
      <div className="text-center py-16 px-12">
        {/* University Name */}
        <h1 className="text-amber-700 text-2xl font-bold tracking-[0.3em] mb-4">VALLIANI UNIVERSITY</h1>

        {/* Certificate Title */}
        <h2 className="text-amber-700 text-4xl font-bold tracking-[0.2em] mb-12">GRADUATION CERTIFICATE</h2>

        {/* Award Text */}
        <p className="text-gray-600 text-lg mb-8">This Certificate is proudly awarded to:</p>

        {/* Recipient Name */}
        <div className="mb-12">
          <p className="text-amber-700 text-5xl font-script italic mb-4">Employee</p>
        </div>

        {/* Description */}
        <div className="text-gray-600 text-base leading-relaxed mb-16 max-w-2xl mx-auto">
          <p>has completed the necessary course of</p>
          <p>study for Valliani University graduation</p>
        </div>

        {/* Signature Section */}
        <div className="flex justify-between items-end mt-16">
          <div className="text-center">
            <div className="w-48 h-0.5 bg-gray-400 mb-2"></div>
            <p className="text-gray-700 font-semibold">President</p>
          </div>

          {/* Center Seal */}
          <div className="mx-8">
            <CertificateSeal />
          </div>

          <div className="text-center">
            <div className="w-48 h-0.5 bg-gray-400 mb-2"></div>
            <p className="text-gray-700 font-semibold">Employee</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CornerDecoration() {
  return (
    <div className="w-16 h-16 relative">
      {/* Outer squares */}
      <div className="absolute top-0 left-0 w-4 h-4 border-2 border-amber-600"></div>
      <div className="absolute top-0 left-5 w-4 h-4 border-2 border-amber-600"></div>
      <div className="absolute top-5 left-0 w-4 h-4 border-2 border-amber-600"></div>

      {/* Inner squares */}
      <div className="absolute top-1 left-1 w-2 h-2 border border-amber-600"></div>
      <div className="absolute top-1 left-6 w-2 h-2 border border-amber-600"></div>
      <div className="absolute top-6 left-1 w-2 h-2 border border-amber-600"></div>

      {/* Connecting lines */}
      <div className="absolute top-2 left-10 w-8 h-0.5 bg-amber-600"></div>
      <div className="absolute top-7 left-10 w-6 h-0.5 bg-amber-600"></div>
      <div className="absolute left-2 top-10 w-0.5 h-8 bg-amber-600"></div>
      <div className="absolute left-7 top-10 w-0.5 h-6 bg-amber-600"></div>
    </div>
  )
}

function CertificateSeal() {
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      {/* Laurel branches */}
      <div className="absolute -left-6 top-1/2 transform -translate-y-1/2">
        <LaurelBranch />
      </div>
      <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 scale-x-[-1]">
        <LaurelBranch />
      </div>

      {/* Central seal */}
      <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center relative">
        <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
          <Star />
        </div>

        {/* Ribbon tails */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-l-transparent border-r-transparent border-t-amber-600"></div>
        </div>
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 -translate-x-1">
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-l-transparent border-r-transparent border-t-amber-600"></div>
        </div>
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 translate-x-1">
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-l-transparent border-r-transparent border-t-amber-600"></div>
        </div>
      </div>
    </div>
  )
}

function LaurelBranch() {
  return (
    <div className="w-8 h-12 relative">
      {/* Branch stem */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-amber-600 transform -translate-x-1/2 rotate-12"></div>

      {/* Leaves */}
      <div className="absolute top-1 left-1 w-2 h-1 bg-amber-600 rounded-full transform rotate-45"></div>
      <div className="absolute top-1 right-1 w-2 h-1 bg-amber-600 rounded-full transform -rotate-45"></div>
      <div className="absolute top-3 left-0 w-2 h-1 bg-amber-600 rounded-full transform rotate-30"></div>
      <div className="absolute top-3 right-0 w-2 h-1 bg-amber-600 rounded-full transform -rotate-30"></div>
      <div className="absolute top-5 left-1 w-2 h-1 bg-amber-600 rounded-full transform rotate-15"></div>
      <div className="absolute top-5 right-1 w-2 h-1 bg-amber-600 rounded-full transform -rotate-15"></div>
      <div className="absolute top-7 left-2 w-2 h-1 bg-amber-600 rounded-full"></div>
      <div className="absolute top-7 right-2 w-2 h-1 bg-amber-600 rounded-full"></div>
    </div>
  )
}

function Star() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-amber-600">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}
