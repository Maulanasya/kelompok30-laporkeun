import { useRef } from "react";
import { Upload, X } from "lucide-react";

export default function UploadBukti({ file, onFileChange }) {
  const inputRef = useRef(null);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    onFileChange?.(f);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onFileChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={handleChange}
        className="hidden"
      />

      {!file ? (
        <button
          type="button"
          onClick={handleClick}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-tertiary hover:bg-tertiary-light/30 cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <Upload size={18} className="text-tertiary" />
          </div>
          <p className="text-xs font-semibold text-primary">
            Pilih file atau tarik ke sini
          </p>
          <p className="text-[10px] text-slate-400">
            JPG, JPEG, PNG, PDF • Maks 5 MB
          </p>
          <span className="mt-1 rounded-full bg-primary px-4 py-1.5 text-[10px] font-bold text-white">
            + Telusuri
          </span>
        </button>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-primary">
              {file.name}
            </p>
            <p className="text-[10px] text-slate-400">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-danger-light hover:text-danger cursor-pointer"
            aria-label="Hapus file"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}