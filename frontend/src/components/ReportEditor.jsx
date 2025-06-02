// src/components/ReportEditor.jsx
import React, { useState, useEffect } from "react";
import { fetchReport, saveReport } from "../api/reports";

export default function ReportEditor({ sopInstance }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sopInstance) {
      setContent("");
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchReport(sopInstance)
      .then(data => {
        setContent(data.content || "");
      })
      .catch(err => {
        if (err.response && err.response.status === 404) {
          setContent("");
        } else {
          console.error(err);
          setError("소견서를 불러오는 중 오류가 발생했습니다.");
        }
      })
      .finally(() => setLoading(false));
  }, [sopInstance]);

  const handleSave = () => {
    if (!sopInstance) return;
    setSaving(true);
    setError(null);
    saveReport(sopInstance, content)
      .then(() => {})
      .catch(err => {
        console.error(err);
        setError("소견서를 저장하는 중 오류가 발생했습니다.");
      })
      .finally(() => setSaving(false));
  };

  return (
    <div style={{
      display: "flex", 
      flexDirection: "column", 
      height: "100%", 
      padding: 15, 
      boxSizing: "border-box", 
      marginTop: -15,
      fontSize: 15,
      color: "#666" }}>
      {!sopInstance ? (
        <p>파일을 선택하면 소견서를 불러옵니다.</p>
      ) : loading ? (
        <p>로딩 중...</p>
      ) : (
        <>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <textarea
            style={{
              flex: 1,
              width: "100%",
              resize: "none",
              fontSize: 14,
              padding: 12,
              backgroundColor: "#2C2C2C",
              borderRadius: 4,
              boxSizing: "border-box",
              border: 'none',
              color: 'white',
              marginTop: 15
            }}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="소견서를 입력하세요..."
            onKeyDown={e => {
              // MODIFIED: 화살표 키 이벤트 전파 방지
              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.stopPropagation();
              }
            }}
          />
          <button
            style={{
              marginTop: 8,
              alignSelf: "flex-end",
              padding: "6px 12px",
              backgroundColor: "#2C2C2C",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </>
      )}
    </div>
  );
}
