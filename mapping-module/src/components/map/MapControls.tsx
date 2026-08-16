interface MapControlsProps {
  riskFilter: "ALL" | "RED" | "YELLOW" | "GREEN";
  showPolice: boolean;
  showUnmanned: boolean;

  onRiskFilterChange: (
    value: "ALL" | "RED" | "YELLOW" | "GREEN"
  ) => void;

  onShowPoliceChange: (value: boolean) => void;
  onShowUnmannedChange: (value: boolean) => void;
}

function MapControls({
  riskFilter,
  showPolice,
  showUnmanned,
  onRiskFilterChange,
  onShowPoliceChange,
  onShowUnmannedChange,
}: MapControlsProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "white",
        padding: "12px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
        zIndex: 1000,
        fontSize: "14px",
        minWidth: "150px",
      }}
    >
      <strong>Map Filters</strong>

      <div style={{ marginTop: "10px" }}>
        <label>
          <input
            type="radio"
            name="riskFilter"
            checked={riskFilter === "ALL"}
            onChange={() => onRiskFilterChange("ALL")}
          />
          {" "}ALL
        </label>
      </div>

      <div style={{ marginTop: "6px" }}>
        <label>
          <input
            type="radio"
            name="riskFilter"
            checked={riskFilter === "RED"}
            onChange={() => onRiskFilterChange("RED")}
          />
          {" "}🔴 RED
        </label>
      </div>

      <div style={{ marginTop: "6px" }}>
        <label>
          <input
            type="radio"
            name="riskFilter"
            checked={riskFilter === "YELLOW"}
            onChange={() => onRiskFilterChange("YELLOW")}
          />
          {" "}🟡 YELLOW
        </label>
      </div>

      <div style={{ marginTop: "6px" }}>
        <label>
          <input
            type="radio"
            name="riskFilter"
            checked={riskFilter === "GREEN"}
            onChange={() => onRiskFilterChange("GREEN")}
          />
          {" "}🟢 GREEN
        </label>
      </div>

      <div
        style={{
          borderTop: "1px solid #ddd",
          margin: "10px 0",
        }}
      />

      <label>
        <input
          type="checkbox"
          checked={showPolice}
          onChange={(e) => onShowPoliceChange(e.target.checked)}
        />
        {" "}Police Units
      </label>

      <div style={{ marginTop: "6px" }}>
        <label>
          <input
            type="checkbox"
            checked={showUnmanned}
            onChange={(e) => onShowUnmannedChange(e.target.checked)}
          />
          {" "}UNMANNED
        </label>
      </div>
    </div>
  );
}

export default MapControls;