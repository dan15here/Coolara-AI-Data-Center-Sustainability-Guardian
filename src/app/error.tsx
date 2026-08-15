'use client'

export default function Error({ reset }: Readonly<{ error: Error & { digest?: string }, reset: () => void }>) { return <div className="error-state"><p className="eyebrow">WORKSPACE UNAVAILABLE</p><h1>Unable to load this view</h1><p>The synthetic data view could not be displayed. Try again or return to Command Center.</p><button className="button" onClick={reset}>Try again</button></div> }
