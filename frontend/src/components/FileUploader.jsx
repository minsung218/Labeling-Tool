// src/components/FileUploader.jsx

// 웹에서 로컬폴더 단위로 DICOM 파일 업로드
// 디렉토리 선택 -> uploadFIles(files) in api/files.js 로 백엔드 요청 보냄
// -> 업로드 성공 시 onUpload() in App.jsx 호출 (부모(App)의 함수 실행)
// -> 부모의 setRefreshTrigger 호출 : 파일 리스트 다시 불러올 수 있는 상태로 변경
// setRefreshTrigger로 refreshTrigger 변수 업데이트 시켜서 Sidebar의 useEffect 실행
// -> 파일 목록 불러오는 구조

import React, { useRef, useState } from "react";
import { uploadFiles } from "../api/files";

export default function FileUploader({ onUpload }) {
  const inputRef = useRef();
  const [loading, setLoading] = useState(false);

  const handleChange = async e => {
    const files = e.target.files;
    if (!files.length) return;

    setLoading(true);
    try {
      const { saved } = await uploadFiles(files);
      console.log("Uploaded:", saved);
      onUpload();   // 업로드 성공 시 트리거
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "업로드 중 오류");
    } finally {
      setLoading(false);
      inputRef.current.value = null;
    }
  };

  const triggerFileSelect = () => {
    inputRef.current.click();
  };

  return (
    <div style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
      {/* 숨겨진 input */}
      <input
        type="file"
        webkitdirectory=""
        multiple
        ref={inputRef}
        onChange={handleChange}
        disabled={loading}
        accept=".dcm"
        style={{ display: "none" }}
      />

      {/* 사용자 정의 버튼 */}
      <button
        onClick={triggerFileSelect}
        disabled={loading}
        style={{
          padding: "8px 16px",
          backgroundColor: "#2C2C2C",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        폴더 업로드
      </button>

      {loading && <p style={{ marginTop: 8 }}>업로드 중…</p>}
    </div>
  );
}
