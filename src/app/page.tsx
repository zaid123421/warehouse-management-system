export default function Home() {
  return (
    <div className="p-8 space-y-8 bg-surface-light min-h-screen">
      <h1 className="text-headline-lg font-bold text-primary-main-light font-arabic">
        لوحة تجربة ألوان TreadX
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* تجربة الـ Primary Colors */}
        <div className="p-6 rounded-lg bg-primary-light border border-primary-main-light">
          <h2 className="text-title-lg text-primary-onContainer font-semibold mb-4">
            الألوان الأساسية (Primary)
          </h2>
          <div className="space-y-2">
            <button className="w-full bg-primary-main-light text-white p-3 rounded-md">
              زر بلون Light Mode
            </button>
            <button className="w-full bg-primary-main-dark text-white p-3 rounded-md">
              زر بلون Dark Mode
            </button>
          </div>
        </div>

        {/* تجربة الـ Surface & Secondary */}
        <div className="p-6 rounded-lg bg-surface-container border border-secondary-main">
          <h2 className="text-title-lg text-secondary-onSurface font-semibold mb-4">
            الأسطح والنصوص (Surface)
          </h2>
          <p className="text-body-md text-secondary-main">
            هذا النص يستخدم لون `secondary-main` فوق سطح `surface-container`.
          </p>
          <div className="mt-4 p-4 bg-surface-bright rounded-sm text-center">
            سطح مشرق (Surface Bright)
          </div>
        </div>
      </div>

      {/* تجربة الـ Spacing و Radius */}
      <div className="flex gap-4 items-center">
        <span className="p-4 bg-white rounded-sm shadow-sm">Radius SM</span>
        <span className="p-6 bg-white rounded-md shadow-sm">Radius MD</span>
        <span className="p-8 bg-white rounded-lg shadow-sm">Radius LG</span>
      </div>
    </div>
  );
}
