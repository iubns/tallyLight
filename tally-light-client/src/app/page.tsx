// src/app/page.tsx
"use client"

import { useState, useEffect } from "react"
import api from "@/config/axios"

type Screen = {
  id: string
  PGM: boolean   // 송출(Program)
  RVW: boolean   // 대기(Preview)
}

// 기본 6개: 모두 비활성(회색)
const defaultScreens: Screen[] = Array.from({ length: 6 }, (_, i) => ({
  id: `${i + 1}`,
  PGM: false,
  RVW: false,
}))

export default function Home() {
  const [screens, setScreens] = useState<Screen[]>(defaultScreens)

  // 마운트 직후와 1초마다 서버 상태 가져오기
  useEffect(() => {
    fetchData()
    const iv = setInterval(fetchData, 1000)
    return () => clearInterval(iv)
  }, [])

  // 서버로부터 최신 screen-state 조회
  async function fetchData() {
    try {
      const { data } = await api.get<Screen[]>("/screen-state")
      // 최소 6개 이상 넘어오면 앞 6개만 사용
      if (Array.isArray(data) && data.length >= 6) {
        setScreens(data.slice(0, 6))
      }
    } catch {
      console.warn("서버 연결 실패 — 기본 레이아웃 유지")
    }
  }

  // 송출 버튼 클릭 핸들러
  async function handleProgram(screenId: string) {
    // 로컬 즉시 반영: 클릭한 id만 PGM=true
    setScreens((prev) =>
      prev.map((s) => ({ ...s, PGM: s.id === screenId }))
    )
    try {
      await api.post("/program-button", { screenId })
    } catch {
      console.warn("송출 버튼 전송 실패")
    }
  }

  // 대기 버튼 클릭 핸들러
  async function handlePreview(screenId: string) {
    setScreens((prev) =>
      prev.map((s) => ({ ...s, RVW: s.id === screenId }))
    )
    try {
      await api.post("/push-button", { screenId })
    } catch {
      console.warn("대기 버튼 전송 실패")
    }
  }

  // 전환 버튼 클릭 핸들러
  async function handleSwitch() {
    setScreens((prev) =>
      prev.map((s) => ({ ...s, PGM: s.RVW, RVW: s.PGM }))
    )
    try {
      await api.post("/switch-screen")
    } catch {
      console.warn("전환 버튼 전송 실패")
    }
  }

  // 0~2: Program, 3~5: Preview
  const programRow = screens.slice(0, 3)
  const previewRow = screens.slice(3, 6)

  return (
    <div className="container">
      <h1 className="title">Tally Light Control</h1>

      <button className="switch-btn" onClick={handleSwitch}>
        전환
      </button>

      <div className="row-label">송출 (Program)</div>
      <div className="grid-row">
        {programRow.map((s, i) => (
          <button
            key={s.id}
            onClick={() => handleProgram(s.id)}
            className={`grid-btn ${s.PGM ? "active-program" : ""}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="row-label">대기 (Preview)</div>
      <div className="grid-row">
        {previewRow.map((s, i) => (
          <button
            key={s.id}
            onClick={() => handlePreview(s.id)}
            className={`grid-btn ${s.RVW ? "active-preview" : ""}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <style jsx>{`
        .container {
          max-width: 360px;
          margin: 40px auto;
          padding: 0 10px;
          font-family: sans-serif;
          text-align: center;
        }
        .title {
          font-size: 1.6rem;
          margin-bottom: 16px;
        }
        .switch-btn {
          margin-bottom: 24px;
          padding: 8px 24px;
          background: #444;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .switch-btn:hover {
          background: #666;
        }
        .row-label {
          margin: 12px 0 8px;
          font-weight: bold;
        }
        .grid-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .grid-btn {
          position: relative;
          width: 100%;
          padding-top: 100%; /* 정사각형 비율 유지 */
          background: #eee;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-weight: bold;
          color: #333;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .grid-btn > * {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .active-program {
          background: green;
          color: #fff;
          border-color: darkgreen;
        }
        .active-preview {
          background: red;
          color: #fff;
          border-color: darkred;
        }
      `}</style>
    </div>
  )
}
