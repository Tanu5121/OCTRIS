function MapLegend() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "30px",
        right: "10px",
        background: "white",
        padding: "12px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
        zIndex: 1000,
        fontSize: "14px",
        minWidth: "120px",
      }}
    >
      <strong>Risk Level</strong>

      <div style={{ marginTop: "8px" }}>
        🔴 High
      </div>

      <div>
        🟡 Medium
      </div>

      <div>
        🟢 Low
      </div>

      <div
        style={{
          borderTop: "1px solid #ddd",
          margin: "10px 0",
        }}
      />
       <strong>Police</strong>

      <div style={{ marginTop: "8px" }}>
        👮 Police Unit
      </div>

      <div style={{ marginTop: "5px" }}>
        ⚠️ UNMANNED
      </div>

      <div
        style={{
          borderTop: "1px solid #ddd",
          margin: "10px 0",
        }}
      />

      <strong>Police Status</strong>

      <div style={{ marginTop: "8px" }}>
        🟢 Available
      </div>

      <div>
        🟠 Deployed
      </div>

      <div>
        🔴 Busy
      </div>
      <div >
        ⚫ Offline
      </div>
    </div>
  );
}

export default MapLegend;