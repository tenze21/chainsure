import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ApiError, getExplorerToken } from "../lib/api";

// ── helpers ─────────────────────────────────────────────────────────────────
const CONTRACT_ADDRESS = "0xEe73BEe5644f0Aae106d424C321c4db4CF50Bc45";
const CREATOR_ADDRESS = "0x2193870DfFbd97c4E86F8791D6b3419b9D9dFf99";

function AddrLink({ addr }) {
  const etherscan = `https://sepolia.etherscan.io/address/${addr}`;
  return (
    <a
      href={etherscan}
      target="_blank"
      rel="noopener noreferrer"
      title={addr}
      className="text-teal-600 hover:text-teal-700 hover:underline font-mono text-sm break-all transition-colors"
    >
      {addr}
    </a>
  );
}

function attr(attributes, key) {
  return attributes?.find((a) => a.trait_type === key)?.value ?? "—";
}

// ── states ───────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="w-full rounded-xl border border-blue-100 bg-blue-50 flex flex-col items-center justify-center py-24 gap-4">
      {/* cube-inside-hexagon icon */}
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        className="text-blue-300"
      >
        {/* outer hexagon */}
        <path
          d="M32 4L56 18V46L32 60L8 46V18L32 4Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* 3D cube lines inside */}
        <path
          d="M32 20L44 27V41L32 48L20 41V27L32 20Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M32 20V48M20 27L44 27M20 41L44 41"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
          opacity="0.5"
        />
        <path
          d="M32 20L20 27M32 20L44 27M32 48L20 41M32 48L44 41"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
          opacity="0.4"
        />
      </svg>
      <p className="text-blue-400 text-center font-medium max-w-xs">
        Enter the NFT token ID in the search bar above to view details.
      </p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="w-full rounded-xl border border-red-200 bg-red-50 flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-14 h-14 rounded-full border-2 border-red-500 flex items-center justify-center">
        <svg
          className="w-7 h-7 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <p className="text-gray-400 font-medium text-center max-w-xs">
        {message || "Could not find an NFT with provided token ID"}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="w-full rounded-xl border border-blue-100 bg-blue-50 flex flex-col items-center justify-center py-24 gap-4">
      <svg
        className="w-10 h-10 text-teal-500 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <p className="text-blue-400 font-medium">Fetching token data…</p>
    </div>
  );
}

// ── result card ──────────────────────────────────────────────────────────────
function TokenResult({ tokenId, data }) {
  const { name, image, owner, attributes } = data;

  const policyId = attr(attributes, "Policy ID");
  const category = attr(attributes, "Category");
  const coverage = attr(attributes, "Coverage Amount");
  const paymentType = attr(attributes, "Payment Type");
  const issueDate = attr(attributes, "Issue Date");
  const duration = attr(attributes, "Duration (days)");

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fadeIn">
      {/* NFT image */}
      <div className="rounded-xl overflow-hidden shadow-md">
        <img
          src={image}
          alt={name}
          className="w-full h-auto object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/600x600?text=No+Image";
          }}
        />
      </div>

      {/* details */}
      <div className="flex flex-col gap-5">
        <h2 className="text-2xl font-bold text-gray-900">
          Chainsure Policy Token #{tokenId}
        </h2>

        {/* NFT Details card */}
        <div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm">
          <p className="font-semibold text-gray-800 mb-4">NFT Details</p>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              <DetailRow label="Owner" value={<AddrLink addr={owner} />} />
              <DetailRow
                label="Contract Address"
                value={<AddrLink addr={CONTRACT_ADDRESS} />}
              />
              <DetailRow
                label="Creator"
                value={<AddrLink addr={CREATOR_ADDRESS} />}
              />
              <DetailRow
                label="Token ID"
                value={
                  <span className="font-semibold text-gray-800">{tokenId}</span>
                }
              />
              <DetailRow
                label="Token Standard"
                value={
                  <span className="font-semibold text-gray-800">ERC-721</span>
                }
              />
            </tbody>
          </table>
        </div>

        {/* Policy Details card */}
        <div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm">
          <p className="font-semibold text-gray-800 mb-4">Policy Details</p>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              <DetailRow
                label="Policy ID"
                value={
                  <span className="font-mono text-gray-700 text-xs">
                    {policyId}
                  </span>
                }
              />
              <DetailRow
                label="Category"
                value={
                  <span className="font-semibold text-gray-800">
                    {category}
                  </span>
                }
              />
              <DetailRow
                label="Coverage Amount"
                value={
                  <span className="font-semibold text-gray-800">
                    {Number(coverage).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </span>
                }
              />
              <DetailRow
                label="Payment Type"
                value={
                  <span className="font-semibold text-gray-800 capitalize">
                    {paymentType}
                  </span>
                }
              />
              <DetailRow
                label="Issue Date"
                value={
                  <span className="font-semibold text-gray-800">
                    {issueDate}
                  </span>
                }
              />
              <DetailRow
                label="Duration (Days)"
                value={
                  <span className="font-semibold text-gray-800">
                    {duration}
                  </span>
                }
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <tr>
      <td className="py-2.5 pr-4 text-gray-500 whitespace-nowrap w-40">
        {label}
      </td>
      <td className="py-2.5 text-gray-800">{value}</td>
    </tr>
  );
}

// ── main page ────────────────────────────────────────────────────────────────
export default function ExplorerPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [result, setResult] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [tokenId, setTokenId] = useState(null);

  async function handleSearch(e) {
    e?.preventDefault();
    const id = query.trim();
    if (!id) return;

    setStatus("loading");
    setResult(null);
    setErrMsg("");

    try {
      const json = await getExplorerToken(id);

      if (json.success || json.sucess) {
        setTokenId(id);
        setResult(json.data);
        setStatus("success");
      } else {
        // derive a clean user-facing message
        const raw = json.error?.message ?? "";
        const notFound =
          raw.includes("ERC721NonexistentToken") ||
          raw.includes("NonexistentToken");
        setErrMsg(
          notFound
            ? "Could not find an NFT with provided token ID"
            : json.error?.message || "An unexpected error occurred",
        );
        setStatus("error");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        const notFound =
          err.message.includes("ERC721NonexistentToken") ||
          err.message.includes("NonexistentToken");
        setErrMsg(
          notFound
            ? "Could not find an NFT with provided token ID"
            : err.message,
        );
      } else {
        setErrMsg("Network error — please try again.");
      }
      setStatus("error");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* page body */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 pt-32 pb-20 flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Chainsure Explorer
        </h1>

        {/* search bar */}
        <div className="flex items-center gap-0 w-full max-w-sm">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter tokenID..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-l-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
          />
          <button
            onClick={handleSearch}
            disabled={status === "loading"}
            className="px-3.5 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white rounded-r-md transition-colors flex items-center justify-center"
          >
            {status === "loading" ? (
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* result area */}
        {status === "idle" && <EmptyState />}
        {status === "loading" && <LoadingState />}
        {status === "error" && <ErrorState message={errMsg} />}
        {status === "success" && result && (
          <TokenResult tokenId={tokenId} data={result} />
        )}
      </main>

      {/* footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              className="text-teal-500"
            >
              <path
                d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span className="font-semibold text-gray-800">ChainSure</span>
          </div>
          <p className="text-sm text-gray-500 text-center">
            PRJ-303 Spring 2026 · Gyalpozhing College of Information Technology,
            RUB
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-800 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-800 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-gray-800 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>

      {/* fade-in keyframe (add to your global CSS or tailwind config) */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .animate-fadeIn { animation: fadeIn 0.35s ease both; }
      `}</style>
    </div>
  );
}
