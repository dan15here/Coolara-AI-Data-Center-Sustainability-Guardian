import Image from 'next/image'

export default function Loading() {
  return (
    <div
      className="grid min-h-screen place-items-center bg-[#07100f]/95 px-6 text-teal-100"
      aria-live="polite"
      aria-label="Opening Coolara workspace"
      role="status"
    >
      <div className="flex flex-col items-center gap-5">
        <Image
          src="/logos/coolara-wordmark-c-icon.svg"
          alt="Coolara"
          width={270}
          height={72}
          priority
        />
        <div className="flex items-center gap-3 text-sm font-medium">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-300/35 border-t-teal-300" />
          Opening Command Center
        </div>
      </div>
    </div>
  )
}
