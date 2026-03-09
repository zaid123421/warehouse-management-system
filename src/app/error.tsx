"use client";


export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="relative flex flex-col items-center justify-center min-h-screen px-6">
			{/* Background Image */}
			<div
				className="absolute inset-0 z-0 bg-contain obj bg-center opacity-5"
				style={{ backgroundImage: "url('/full_background.png')" }}
			/>
		</div>
	);
}
