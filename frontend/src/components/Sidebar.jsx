// src/components/Sidebar.jsx

// useEffect로 currentFolder 또는 regreshTrigger 변경되면,
// -> listFiles(currentFolder) in api/files.js GET api 호출
// Up 버튼 누르면 상위 폴더 이동
// 디렉토리 클릭 시, onFolderChange(rel) in App.jsx / 파일 클릭 시, onSelect(rel) in App.jsx

import React, { useState, useEffect, useRef } from "react";
import { listFiles, uploadFiles } from "../api/files";

export default function Sidebar({
  currentFolder, // 현재 보고 있는 상대 경로
  onFolderChange, // 폴더 이동 콜백 (부모 함수)
  refreshTrigger, // 업로드 후 갱신 용도
  onSelect, // 파일 선택 콜백 (부모 함수)
  onUpload,  // MODIFIED: onUpload prop 받기
  selectedFile
}) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);  // MODIFIED: 업로드 상태
  const inputRef = useRef();  // MODIFIED: hidden file input ref

  useEffect(() => {
    setLoading(true);
    listFiles(currentFolder)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [currentFolder, refreshTrigger]);

  const goUp = () => {
    if (!currentFolder) return;
    const parts = currentFolder.split("/");
    parts.pop();
    onFolderChange(parts.join("/"));
  };

  const handleUploadChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    try {
      await uploadFiles(files);  // MODIFIED: 폴더 업로드 로직
      onUpload();              // MODIFIED: 업로드 후 리프레시 호출
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  return (
    <aside style={{
      padding: 8, 
      overflowY: "auto", 
      width: 280,
      display: "flex",
      backgroundColor: "#1E1E1E",
      color: "#CBCBCB",
      flexDirection: "column",
      height: "100%",
      }}>
      
      {/* 고정 헤더 영역 */}
      <div style={{
        marginBottom: 8,
        marginRight: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{
          padding : 10,
          fontSize: 35,
          fontWeight: "bold",
        }}>Files</span>
        <button
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            color: "#CBCBCB",
            fontSize: 30,
            cursor: "pointer",
          }}
          onClick={() => inputRef.current.click()}  // MODIFIED: hidden input 트리거
        >+</button>
        {/* MODIFIED: 폴더 업로드용 hidden input */}
        <input
          type="file"
          webkitdirectory=""
          multiple
          accept=".dcm"
          ref={inputRef}
          style={{ display: 'none' }}
          onChange={handleUploadChange}
          disabled={uploading}
        />
      </div>

      {/* 상위 폴더로 가기 */}
      <button onClick={goUp} disabled={!currentFolder}
      style={{
          background: "none",
          border: "none",
          color: "#CBCBCB",
          cursor: currentFolder ? "pointer" : "not-allowed",
          marginBottom: 15,
        }}
      >⬆ Up</button>
      </div>

      {/* 스크롤 가능한 목록 영역 */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        marginRight: 10
      }}>
      {loading
        ? <p>로딩 중…</p>
        : (
          <ul style={{ listStyle: "none", padding: 0, margin:0 }}>
            {entries.map(({ name, type }) => {
              const rel = currentFolder ? `${currentFolder}/${name}` : name;
              const isFile = type === "file";
              const isSelected = isFile && rel === selectedFile;
              return (
                <li key={rel}
                style={{
                  padding: "4px 8px",
                  cursor: "pointer",
                  borderBottom: "1px solid #2C2C2C",
                  backgroundColor: type === "directory" ?  "#333333" : isSelected ? "#2C2C2C" : "transparent",
                  marginRight: 20,
                  }}>
                  {type === "directory"
                    ? <span onClick={() => onFolderChange(rel)}>📁 {name}</span>
                    : <span onClick={() => onSelect(rel)}>📄 {name}</span>}
                </li>
              );
            })}
          </ul>
        )
      }
      {entries.length === 0 && !loading && <p style={{ padding: 8 }}>(빈 폴더)</p>}
      </div>
    </aside>
  );
}
