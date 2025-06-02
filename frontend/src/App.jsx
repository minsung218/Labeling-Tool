// src/App.jsx
import React, { useState, useEffect } from "react";
// import FileUploader from "./components/FileUploader"; // MODIFIED: FileUploader 제거
import Sidebar      from "./components/Sidebar";
import Viewer       from "./components/Viewer";
import LabelList    from "./components/LabelList";
import ReportEditor from "./components/ReportEditor";
import { deleteLabel as apiDeleteLabel } from "./api/labels";
import { listFiles } from "./api/files";

export default function App() {
  const [currentFolder, setCurrentFolder] = useState("");
  const [selectedFile, setSelectedFile]   = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [labels, setLabels]               = useState([]);
  const [selectedLabelId, setSelectedLabelId] = useState(null);
  const [fileList, setFileList] = useState([]);

  const [sopInstance, setSopInstance] = useState(null);

  // currentFolder가 바뀔 때마다 파일 목록 업데이트
  useEffect(() => {
    listFiles(currentFolder).then((entries) => {
      const files = entries
        .filter((e) => e.type === "file")
        .map((e) => (currentFolder ? `${currentFolder}/${e.name}` : e.name));
      setFileList(files);
    });
  }, [currentFolder, refreshTrigger]);

  const handleDeleteLabel = async (id) => {
    try {
      await apiDeleteLabel(id);
      setLabels(ls => ls.filter(l => l.id !== id));
      if (selectedLabelId === id) setSelectedLabelId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // 'Delete' 키를 눌러서 선택된 라벨 삭제
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedLabelId !== null) {
        handleDeleteLabel(selectedLabelId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLabelId, handleDeleteLabel]);

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      backgroundColor: "#1E1E1E",
      color: "#CBCBCB"
      }}>
      {/* 왼쪽 사이드바 */}
      <div style={{ width: 280, display: "flex", flexDirection: "column" }}>
        <Sidebar // 여기 밑에 써있는 얘들이 변경되면 Sidebar의 useEffect()가 실행됨
          currentFolder={currentFolder}
          selectedFile={selectedFile}
          onFolderChange={setCurrentFolder}
          refreshTrigger={refreshTrigger}
          onSelect={setSelectedFile}
          onUpload={() => setRefreshTrigger(t => t + 1)}  // MODIFIED: onUpload prop 추가
        />
      </div>

      {/* 중앙 뷰어 */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        background: "#1E1E1E",
        borderLeft: "3px solid #2C2C2C",
        borderRight: "3px solid #2C2C2C",
      }}>
        {selectedFile
          ? (
            <Viewer
              file={selectedFile}
              fileList={fileList}
              onNavigate={setSelectedFile}
              onSopChange={setSopInstance}
              labels={labels}
              setLabels={setLabels}
              selectedId={selectedLabelId}
              setSelectedId={setSelectedLabelId}
            />
          )
          : <p>파일을 선택하세요.</p>
        }
      </div>

      <div style={{
        width: 280,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <LabelList
            labels={labels}
            selectedId={selectedLabelId}
            onSelect={setSelectedLabelId}
            onDelete={handleDeleteLabel}
          />
        </div>
        <div style={{
          flex: 1,
          borderTop: "3px solid #2C2C2C",
          overflowY: "auto"
        }}>
          <ReportEditor sopInstance={sopInstance} />
        </div>
      </div>
    </div>
  );
}
