import Form from "next/form";
import { Search } from "lucide-react";

// GET form to /skelbimai?q=..., works without JavaScript too.
export default function SearchForm({
  defaultValue,
  size = "large",
}: {
  defaultValue?: string;
  size?: "large" | "compact";
}) {
  const large = size === "large";

  return (
    <Form
      action="/skelbimai"
      className={`flex w-full items-center gap-2 rounded-2xl bg-white p-2 ring-1 ring-stone-200 transition-shadow focus-within:ring-2 focus-within:ring-brand-500 ${
        large ? "max-w-xl shadow-2xl shadow-black/25" : "max-w-lg shadow-sm"
      }`}
    >
      <label className="flex flex-1 items-center gap-3 pl-3">
        <Search className="size-5 shrink-0 text-stone-400" aria-hidden="true" />
        <span className="sr-only">Paieška</span>
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Vietovė ar savivaldybė"
          className={`w-full bg-transparent text-stone-900 placeholder:text-stone-400 focus:outline-none ${
            large ? "py-3 text-base" : "py-2 text-sm"
          }`}
        />
      </label>
      <button
        type="submit"
        className={`shrink-0 cursor-pointer rounded-xl bg-brand-600 font-semibold text-white transition-colors hover:bg-brand-700 ${
          large ? "px-4 py-3 sm:px-6" : "px-4 py-2 text-sm"
        }`}
      >
        Ieškoti
      </button>
    </Form>
  );
}
