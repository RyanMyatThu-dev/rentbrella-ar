import { Wordmark } from '../components/Wordmark'
import { formatSize, MODELS, type ArModel } from '../models'

export function PickerScreen({ onPick }: { onPick: (model: ArModel) => void }) {
  return (
    <main className="safe-top safe-bottom mx-auto min-h-full max-w-md px-6">
      <Wordmark />
      <h1 className="mt-8 text-[28px] leading-tight font-semibold">Choose a model</h1>
      <ul className="mt-6 flex flex-col gap-3">
        {MODELS.map((model) => (
          <li key={model.id}>
            <button
              type="button"
              onClick={() => onPick(model)}
              className="flex w-full items-center gap-4 rounded-xl border border-line p-3 text-left active:bg-stage"
            >
              <img
                src={model.poster}
                alt=""
                width={96}
                height={96}
                className="h-24 w-24 shrink-0 rounded-lg bg-stage object-cover"
              />
              <span className="min-w-0">
                <span className="block text-[17px] font-semibold">{model.name}</span>
                <span className="mt-0.5 block text-[14px] leading-snug text-muted">
                  {model.description}
                </span>
                <span className="mt-1.5 block text-[13px] text-muted tabular-nums">
                  {formatSize(model.size)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
