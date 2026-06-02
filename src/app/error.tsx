"use client";


export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="relative flex flex-col items-center justify-center gap-4 min-h-screen px-6">
			<div
				className="absolute inset-0 z-0 bg-contain obj bg-center opacity-5"
				style={{ backgroundImage: "url('/full_background.png')" }}
			/>
			<p className="relative z-10 text-lg font-semibold text-foreground">
				Something went wrong.
			</p>
			<p className="relative z-10 text-sm text-muted-foreground max-w-md text-center">
				{error.message}
			</p>
			<button
				type="button"
				onClick={reset}
				className="relative z-10 rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm font-medium"
			>
				Try again
			</button>
		</div>
	);
}
