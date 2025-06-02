import React from "react";
import PropTypes from "prop-types";

export default function LabelList({ labels, selectedId, onSelect, onDelete }) {
  return (
    <div
      style={{
        width: 245,
        padding: 0,
        boxSizing: "border-box",
        backgroundColor: "#1E1E1E",
        color: "#CBCBCB",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <h3 style={{
        marginTop: -10,
        marginBottom: 0,
        padding: 10,
        fontSize: 35,
        flexShrink: 0,
        }}>Labels</h3>

      {/* 스크롤 가능한 라벨 목록 */}
      <div
        style={{
          overflowY: "auto",
          width: "100%",
          paddingLeft: 10,
          flexGrow: 1,
        }}
      >

      {labels.map((lbl) => {
        const isSelected = lbl.id === selectedId;
        return (
          <div
            key={lbl.id}
            onClick={() => onSelect(lbl.id)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
              marginLeft: 0,
              padding: "4px",
              borderRadius: 4,
              cursor: "pointer",
              backgroundColor: isSelected ? "#2C2C2C" : "transparent"
            }}
          >
            {/* 라벨 이름만 표시 */}
            <span style={{ fontSize: 20 }}>{lbl.label}</span>
            <button
              style={{
                fontSize: 12,
                marginLeft: 70,
                marginRight: 15,
                background: "none",
                border: "2px solid #CBCBCB",
                borderRadius: '4px',
                color: "#CBCBCB",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(lbl.id);
              }}
            >
              Del
            </button>
          </div>
        );
      })}
      {labels.length === 0 && (
        <p style={{ fontSize: 20, color: "#666", marginLeft: 12 }}>No labels</p>
      )}
    </div>
  </div>
  );
}

LabelList.propTypes = {
  labels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  selectedId: PropTypes.number,
  onSelect: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};
