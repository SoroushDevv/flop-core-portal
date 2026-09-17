"use client";

import React, { useState } from "react";
import styles from "./FdvCalculator.module.css";
import { Calculator, DollarSign, Coins, TrendingUp, Sparkles, RefreshCw } from "lucide-react";

export const FdvCalculator: React.FC = () => {
  const TOTAL_SUPPLY = 18_100_000_000; // 18.1B $FLOP canonical supply

  const [fdv, setFdv] = useState<number>(181_000_000); // Default: $181M FDV => $0.01 per token
  const [tokenHoldings, setTokenHoldings] = useState<number>(100_000);

  const pricePerToken = fdv / TOTAL_SUPPLY;
  const portfolioValue = tokenHoldings * pricePerToken;

  const presets = [
    { label: "$50M FDV", val: 50_000_000 },
    { label: "$181M FDV ($0.01)", val: 181_000_000 },
    { label: "$500M FDV", val: 500_000_000 },
    { label: "$1B FDV", val: 1_000_000_000 },
    { label: "$5B FDV", val: 5_000_000_000 },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.bannerHeader}>
          <div className={styles.badge}>TOKENOMICS MODELER</div>
          <h1 className={styles.title}>
            <span>$FLOP FDV & Valuation</span> <span className={styles.highlight}>Simulator</span>
          </h1>
          <p className={styles.subtitle}>
            Model projected market capitalizations against the fixed <strong>18,100,000,000 $FLOP</strong> canonical supply.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Input Controls */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <Calculator className="w-4 h-4 text-[#00B4D8]" />
            <span>Valuation Parameters</span>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Projected Fully Diluted Valuation (FDV in USD)</label>
            <div className={styles.inputWrapper}>
              <DollarSign className="w-4 h-4 text-slate-400" />
              <input
                type="number"
                value={fdv}
                onChange={(e) => setFdv(Math.max(0, Number(e.target.value)))}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.presetsRow}>
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setFdv(p.val)}
                className={`${styles.presetBtn} ${fdv === p.val ? styles.presetBtnActive : ""}`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Your $FLOP Holdings</label>
            <div className={styles.inputWrapper}>
              <Coins className="w-4 h-4 text-[#00B4D8]" />
              <input
                type="number"
                value={tokenHoldings}
                onChange={(e) => setTokenHoldings(Math.max(0, Number(e.target.value)))}
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Results Display */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
            <span>Projected Metrics</span>
          </div>

          <div className={styles.resultBox}>
            <div className={styles.resultLabel}>IMPLIED PRICE PER $FLOP</div>
            <div className={styles.resultPrice}>
              ${pricePerToken < 0.0001 ? pricePerToken.toExponential(4) : pricePerToken.toFixed(4)}
            </div>
          </div>

          <div className={styles.resultBox}>
            <div className={styles.resultLabel}>PORTFOLIO VALUE ({tokenHoldings.toLocaleString()} $FLOP)</div>
            <div className={styles.resultValue}>
              ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className={styles.metaRow}>
            <span>Canonical Supply:</span>
            <strong className="text-white">18,100,000,000 $FLOP</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FdvCalculator;