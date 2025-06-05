"use client"

import styles from "./page.module.css"
import axiosInstance from "@/config/axios"
import { useEffect } from "react"

export default function Home() {
  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data } = await axiosInstance.get("/screen-state")

    alert(JSON.stringify(data))
    console.log(data)
  }
  return <div className={styles.page}>asd</div>
}
