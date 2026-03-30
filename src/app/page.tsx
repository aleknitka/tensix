export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-8 text-center bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-md space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          Welcome to Tensix
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Conduct multi-perspective LLM evaluations using the Six Thinking Hats method.
        </p>
        <div className="pt-4">
          <button className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white transition-colors bg-zinc-900 rounded-lg hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
            Start a New Evaluation
          </button>
        </div>
      </div>
    </div>
  );
}
