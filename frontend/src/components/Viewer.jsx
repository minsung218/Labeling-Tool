// src/components/Viewer.jsx
import React, { useEffect, useRef, useState } from "react";
import cornerstone from "cornerstone-core";
import dicomParser from "dicom-parser";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import { getDicomUrl } from "../api/dicom";
import { listLabels, createLabel, updateLabel, deleteLabel } from "../api/labels";

// Cornerstone 설정
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneWADOImageLoader.configure({
  webWorkerPath: "/cornerstoneDICOMImageLoader.worker.min.js",
  taskConfiguration: {
    decodeTask: {
      codecsPath: "/cornerstoneWADOImageLoaderCodecs.js",
      usePDFJS: false,
    },
  },
});

export default function Viewer({
  file,
  fileList,
  onNavigate,  
  labels,
  setLabels,
  selectedId,
  setSelectedId,
  onSopChange,
}) {
  const elementRef = useRef(null);

  // 드래그 생성 상태
  const [drawing, setDrawing] = useState(false);
  const [startPt, setStartPt] = useState({ x: 0, y: 0 });
  const [newBox, setNewBox] = useState(null);

  // 리사이즈 상태
  const [resizing, setResizing] = useState(null);

  // 뷰어 크기
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 파일명, 환자 이름, SOP UID
  const [filename, setFilename] = useState("");
  const [patientName, setPatientName] = useState("");
  const [sopUid, setSopUid] = useState("");

  // 파일명 추출 헬퍼
  const getFilename = () => {
    if (file?.name) return file.name;
    const url = getDicomUrl(file);
    const params = new URLSearchParams(url.split("?")[1] || "");
    return params.get("file")?.split("/").pop() || "";
  };

  // 이미지 로드 및 라벨 조회
  useEffect(() => {
    if (!file) {
      setLabels([]);
      return;
    }
    const el = elementRef.current;
    cornerstone.enable(el);

    cornerstone
      .loadImage(`wadouri:${getDicomUrl(file)}`)
      .then((image) => {
        // 이미지 크기 세팅
        el.style.width = `${image.columns}px`;
        el.style.height = `${image.rows}px`;
        setDimensions({ width: image.columns, height: image.rows });

        // SOP UID, filename
        const uid = image.data.string("x00080018"); // uid
        const name = image.data.string("x00100010") || "Unknown"; // 환자 이름
        onSopChange(uid);
        setSopUid(uid);
        setPatientName(name);
        setFilename(getFilename());


        // 이미지 디스플레이
        cornerstone.displayImage(el, image);
        cornerstone.resize(el);
        const vp = cornerstone.getViewport(el);
        vp.scale = 1;
        vp.translation = { x: 0, y: 0 };
        cornerstone.setViewport(el, vp);

        // 라벨 조회
        return listLabels(getFilename(), uid);
      })
      .then((fetched) => setLabels(fetched))
      .catch((err) => console.error("Viewer error:", err));

    return () => {
      try {
        cornerstone.disable(el);
      } catch {}
    };
  }, [file, setLabels, onSopChange]);

  // 슬라이스 이동 함수
  const navigate = (direction) => { // direction: -1 (이전), +1 (다음)
    if (!fileList || !file) return;
    const idx = fileList.indexOf(file);
    if (idx === -1) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= fileList.length) return;
    onNavigate(fileList[newIdx]);
  };

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") {
        navigate(-1);
      } else if (e.key === "ArrowRight") {
        navigate(1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [file, fileList]);

  // 라벨 삭제 핸들러
  const handleDelete = async (id) => {
    await deleteLabel(id);
    setLabels((prev) => prev.filter((l) => l.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // 리사이즈 시작
  const handleResizeMouseDown = (e, id, handle) => {
    e.stopPropagation();
    setResizing({ id, handle, startX: e.clientX, startY: e.clientY });
  };

  // 마우스 다운
  const onMouseDown = (e) => {
    if (e.target === elementRef.current) setSelectedId(null);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // 리사이즈 핸들 클릭
    if (e.target.dataset.id && e.target.dataset.handle) {
      handleResizeMouseDown(
        e,
        e.target.dataset.id,
        e.target.dataset.handle
      );
      return;
    }

    // 드래그 시작
    setStartPt({ x, y });
    setNewBox({ x, y, width: 0, height: 0 });
    setDrawing(true);
  };

  // 마우스 무브
  const onMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // 리사이즈 중
    if (resizing) {
      e.preventDefault();
      const dX = e.clientX - resizing.startX;
      const dY = e.clientY - resizing.startY;
      setResizing((p) => ({
        ...p,
        startX: e.clientX,
        startY: e.clientY,
      }));
      setLabels((prev) =>
        prev.map((l) => {
          if (l.id !== resizing.id) return l;
          let { x: lx, y: ly, width: w, height: h } = l;
          switch (resizing.handle) {
            case "bottom-right":
              w += dX;
              h += dY;
              break;
            case "bottom-left":
              lx += dX;
              w -= dX;
              h += dY;
              break;
            case "top-right":
              ly += dY;
              w += dX;
              h -= dY;
              break;
            case "top-left":
              lx += dX;
              ly += dY;
              w -= dX;
              h -= dY;
              break;
            default:
              break;
          }
          return { ...l, x: lx, y: ly, width: w, height: h };
        })
      );
      return;
    }

    // 드래그 중
    if (!drawing) return;
    const dx = x - startPt.x;
    const dy = y - startPt.y;
    const bx = dx < 0 ? x : startPt.x;
    const by = dy < 0 ? y : startPt.y;
    setNewBox({ x: bx, y: by, width: Math.abs(dx), height: Math.abs(dy) });
  };

  // 마우스 업
  const onMouseUp = async () => {
    if (resizing) {
      const lbl = labels.find((l) => l.id === resizing.id);
      if (lbl)
        await updateLabel(lbl.id, {
          x: lbl.x,
          y: lbl.y,
          width: lbl.width,
          height: lbl.height,
        });
      setResizing(null);
      return;
    }
    if (!drawing || !newBox) return;
    setDrawing(false);
    const { x, y, width, height } = newBox;
    setNewBox(null);
    if (width < 10 || height < 10) return;
    const nx = width < 0 ? x + width : x;
    const ny = height < 0 ? y + height : y;
    const created = await createLabel({
      filename,
      sop_instance: sopUid,
      label: "nodule",
      x: nx,
      y: ny,
      width,
      height,
    });
    setLabels((prev) => [...prev, created]);
  };

  // 리사이즈 핸들 포지션
  const handles = [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ];

  return (
    <div style={{
      textAlign: "center",
       backgroundColor: "#1E1E1E",
       padding: 16,
       color: "#CBCBCB"
      }}>
      <div
        style={{
          position: "relative",
          width: dimensions.width,
          height: dimensions.height,
          display: "inline-block"
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        <div
          style={{
            position: "absolute",
            top: -50,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "30px",
            fontWeight: "bold",
            color: "#CBCBCB"
          }}
        >
          {patientName}
        </div>

        <div
          ref={elementRef}
          style={{
            width: dimensions.width,
            height: dimensions.height,
            background: "black",
          }}
        />
        {newBox && (
          <div
            style={{
              position: "absolute",
              left: newBox.x,
              top: newBox.y,
              width: newBox.width,
              height: newBox.height,
              border: "2px dashed blue",
              boxSizing: "context-box",
            }}
          />
        )}
        {labels.map((lbl) => (
          <div
            key={lbl.id}
            style={{
              position: "absolute",
              left: lbl.x,
              top: lbl.y,
              width: lbl.width,
              height: lbl.height,
              border: "2px solid red",
              boxSizing: "context-box",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(lbl.id);
            }}
            onDoubleClick={() => handleDelete(lbl.id)}
          >
            {selectedId === lbl.id &&
              handles.map((handle) => {
                const size = 8;
                const corners = {
                  "top-left": { x: 0, y: 0 },
                  "top-right": { x: lbl.width, y: 0 },
                  "bottom-left": { x: 0, y: lbl.height },
                  "bottom-right": { x: lbl.width, y: lbl.height },
                };
                const cursorMap = {
                  "top-left": "nw-resize",
                  "top-right": "ne-resize",
                  "bottom-left": "sw-resize",
                  "bottom-right": "se-resize",
                };
                const { x: cx, y: cy } = corners[handle];
                return (
                  <div
                    key={handle}
                    data-id={lbl.id}
                    data-handle={handle}
                    style={{
                      position: "absolute",
                      left: `${cx}px`,                     
                      top: `${cy}px`,                      
                      transform: "translate(-50%, -50%)",
                      width: size,
                      height: size,
                      background: "white",
                      border: "1px solid black",
                      cursor: cursorMap[handle],
                      zIndex: 10,
                      pointerEvents: "auto",
                    }}
                    onMouseDown={(e) =>
                      handleResizeMouseDown(e, lbl.id, handle)
                    }
                  />
                );
              })}
          </div>
        ))}

        <button
          onClick={() => navigate(-1)}
          disabled={!fileList || fileList.indexOf(file) <= 0}
          style={{
            position: "absolute",
            backgroundColor: "#2C2C2C",
            color: "#fff",
            left: 0,
            bottom: -40,
          }}
        >
          ◀ 이전
        </button>
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: -40,
            transform: "translateX(-50%)",
            fontWeight: "bold",
          }}
        >
          {filename}
        </div>
        <button
          onClick={() => navigate(1)}
          disabled={!fileList || fileList.indexOf(file) === fileList.length - 1}
          style={{
            position: "absolute",
            backgroundColor: "#2C2C2C",
            color: "#fff",
            right: 0,
            bottom: -40,
          }}
        >
          다음 ▶
        </button>
      </div>
    </div>
  );
}
