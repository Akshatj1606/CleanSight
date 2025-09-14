    import React, { useState, useRef } from 'react';

/**
 * AI Detection Widget
 * Minimal client for the backend /predict endpoint.
 * Assumes backend running at http://localhost:5000 (configurable via VITE_API_URL).
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AIDetectionWidget() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const inputRef = useRef();

  const onSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const detect = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_URL}/predict`, { method: 'POST', body: form });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Detection failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md border border-gray-200 rounded-xl p-5 bg-white">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">AI Garbage Detection</h3>
      <p className="text-xs text-gray-500 mb-4">Upload an image to run on-device YOLO inference.</p>

      {!preview && (
        <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg h-40 cursor-pointer hover:border-gray-400 transition text-gray-500 text-sm">
          <input ref={inputRef} type="file" accept="image/*" onChange={onSelect} className="hidden" />
          <span>Select image</span>
          <span className="text-[11px] text-gray-400">PNG / JPG</span>
        </label>
      )}

      {preview && (
        <div className="relative mb-3">
          <img src={preview} alt="preview" className="rounded-lg w-full object-cover max-h-64" />
          <button onClick={reset} className="absolute top-2 right-2 bg-black/60 text-white text-[11px] px-2 py-1 rounded">Reset</button>
        </div>
      )}

      <div className="flex gap-2 mb-3">
        <button onClick={detect} disabled={!file || loading} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 text-white text-sm font-medium py-2 rounded transition">
          {loading ? 'Detecting…' : 'Run Detection'}
        </button>
        <button onClick={reset} disabled={!file || loading} className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded disabled:opacity-50">Clear</button>
      </div>

      {error && <div className="text-xs text-red-600 mb-2">{error}</div>}

      {result && (
        <div className="mt-3 space-y-3">
          <div className="text-xs text-gray-600 flex items-center gap-2">
            <span className="font-medium text-gray-900">Result:</span>
            {result.garbage_detected ? (
              <span className="text-green-600 font-semibold">Garbage Detected ({result.confidence})</span>
            ) : (
              <span className="text-gray-500">No garbage above threshold</span>
            )}
          </div>
          {result.annotated_image && (
            <img
              src={`data:image/png;base64,${result.annotated_image}`}
              alt="annotated"
              className="rounded-md border border-gray-200"
            />
          )}
        </div>
      )}
    </div>
  );
}
