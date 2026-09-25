.container {
  width: 100%;
  max-width: 1100px;
  margin: 12px auto 80px auto;
  font-family: var(--font-mono, monospace);
  color: #f8fafc;
}

.banner {
  background: rgba(11, 15, 25, 0.95);
  border: 1px solid #162238;
  border-left: 4px solid #10b981;
  border-radius: 18px;
  padding: 24px 28px;
  margin-bottom: 24px;
  box-shadow: 0 0 35px rgba(16, 185, 129, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.badgeRow {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.badge {
  font-size: 10px;
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.35);
  font-weight: 800;
  text-transform: uppercase;
}

.title {
  font-size: 26px;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
}

.highlight {
  color: #10b981;
}

.subtitle {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 6px;
  line-height: 1.6;
}

/* Stats Highlight Grid */
.metricsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}

.metricCard {
  background: #040813;
  border: 1px solid #16253b;
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metricLabel {
  font-size: 10px;
  color: #64748b;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.metricVal {
  font-size: 22px;
  font-weight: 900;
  color: #ffffff;
}

/* Workspace 2-Columns */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 900px) {
  .grid {
    grid-template-columns: 1.5fr 1fr;
  }
}

.card {
  background: #040813;
  border: 1.5px solid #16253b;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.8);
}

.cardTitle {
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #16253b;
  padding-bottom: 12px;
}

.actionBtn {
  background: #10b981;
  color: #020612;
  border: none;
  border-radius: 12px;
  padding: 12px 22px;
  font-size: 12px;
  font-weight: 900;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.35);
}

.actionBtn:hover {
  background: #34d399;
}

.ruleBox {
  background: #02050c;
  border: 1px solid #142033;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.6;
}

.leaderboardRow {
  background: #060c18;
  border: 1px solid #142033;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}