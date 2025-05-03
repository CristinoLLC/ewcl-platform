// src/app/page.tsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import './globals.css'; // Keep this for Tailwind
import './fallback.css'; // Add this as a fallback

export default function Home() {
  return (
    <main>
      {/* Header */}
      <nav>
        <div>
          <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1d4ed8" }}>
            🧬 EWCL Platform
          </span>
          <span className="status-indicator">
            <span className="status-dot"></span>
            API Online
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Entropy-Weighted Collapse Likelihood
        </motion.h1>
        <motion.p
          className="hero-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Predict residue-level collapse risk from a single structure or
          sequence—no multi-year test required.
        </motion.p>
        <div className="btn-group">
          <Link href="/analysis" className="btn-primary">
            🔍 Start Analysis
          </Link>
          <a
            href="https://github.com/CristinoLLC/ewcl-api-clean"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            📄 GitHub
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer>
        <p>
          © {new Date().getFullYear()} EWCL Platform — Developed by CristinoLLC
        </p>
      </footer>
    </main>
  );
}